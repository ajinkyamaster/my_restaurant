#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * End-to-end security regression suite.
 *
 * Boots the real Express app against an in-memory MongoDB and fires the attacks
 * the review flagged at it: CSRF forgery, NoSQL injection, JWT tampering,
 * refresh-token replay, price tampering, IDOR, booking/checkout races, rate
 * limiting, mass assignment, prototype pollution, MIME sniffing and XSS.
 *
 * Run with:  npm run test:security
 */
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-only-secret-value-".padEnd(48, "0");
process.env.FRONTEND_URL = "http://localhost:3000";
process.env.DB_NAME = "my_restro_security_test";
// A port nothing listens on: the AI branch must degrade, not hang the suite.
process.env.AI_SERVICE_URL = "http://127.0.0.1:59999";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoMemoryServer } = require("mongodb-memory-server");

const results = [];
function check(name, ok, detail = "") {
  results.push({ name, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `   (${detail})` : ""}`);
}
function section(title) {
  console.log(`\n── ${title} ${"─".repeat(Math.max(0, 58 - title.length))}`);
}
const round2 = (n) => Math.round(n * 100) / 100;

function setCookieHeaders(res) {
  if (typeof res.headers.getSetCookie === "function") return res.headers.getSetCookie();
  const single = res.headers.get("set-cookie");
  return single ? [single] : [];
}

class Client {
  constructor(base) {
    this.base = base;
    this.cookies = new Map();
    this.csrfToken = null;
  }

  absorb(res) {
    for (const raw of setCookieHeaders(res)) {
      const pair = raw.split(";")[0];
      const eq = pair.indexOf("=");
      if (eq < 0) continue;
      const name = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      if (!value) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
  }

  rawCookie(name) {
    return this.cookies.get(name) || null;
  }

  async req(method, path, options = {}) {
    const { body, rawBody, headers = {}, csrf = false, withCookies = true } = options;
    const finalHeaders = { ...headers };
    if (rawBody !== undefined || body !== undefined) {
      finalHeaders["Content-Type"] = finalHeaders["Content-Type"] || "application/json";
    }
    if (csrf && this.csrfToken) finalHeaders["X-CSRF-Token"] = this.csrfToken;
    // Merge, never replace: an explicitly supplied cookie (a forged token under
    // test) must travel alongside the jar's CSRF cookie.
    const cookieParts = [];
    if (finalHeaders.Cookie) cookieParts.push(finalHeaders.Cookie);
    if (withCookies && this.cookies.size > 0) {
      cookieParts.push([...this.cookies.entries()].map(([k, v]) => `${k}=${v}`).join("; "));
    }
    if (cookieParts.length > 0) finalHeaders.Cookie = cookieParts.join("; ");

    const res = await fetch(`${this.base}${path}`, {
      method,
      headers: finalHeaders,
      body: rawBody !== undefined ? rawBody : body !== undefined ? JSON.stringify(body) : undefined,
      redirect: "manual"
    });
    this.absorb(res);
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* non-JSON body */
    }
    return { status: res.status, headers: res.headers, text, json };
  }

  async csrf() {
    const res = await this.req("GET", "/api/csrf");
    this.csrfToken = (res.json && res.json.csrfToken) || res.headers.get("x-csrf-token");
    return this.csrfToken;
  }

  async login(kind, username, password) {
    await this.csrf();
    return this.req("POST", `/api/${kind}/login`, {
      body: { username, password },
      csrf: true,
      headers: { Origin: process.env.FRONTEND_URL }
    });
  }
}

async function main() {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongo.getUri();

  const dbModule = require("../data/database");
  await dbModule.connectToDb();
  const dbi = dbModule.getDb();

  const app = require("../app");
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  // ─── Seed ───────────────────────────────────────────────
  const adminHash = await bcrypt.hash("AdminPass123", 10);
  const managerHash = await bcrypt.hash("ManagerPass123", 10);
  await dbi.collection("admins").insertOne({ username: "admin", password: adminHash, tokenVersion: 0 });
  await dbi
    .collection("managers")
    .insertOne({ username: "manager", password: managerHash, tokenVersion: 0 });
  await dbi.collection("tables").insertMany(
    [1, 2, 3, 4, 5, 6].map((tableNumber) => ({
      tableNumber,
      capacity: 4,
      isVacant: true,
      createdAt: new Date()
    }))
  );
  const menuInsert = await dbi.collection("menu").insertMany([
    { name: "Paneer Tikka", price: 500 },
    { name: "Butter Naan", price: 40 }
  ]);
  const paneerId = String(menuInsert.insertedIds[0]);

  // ─── 1. Security headers ────────────────────────────────
  section("Security headers");
  const probe = new Client(base);
  const health = await probe.req("GET", "/api/health");
  const csp = health.headers.get("content-security-policy") || "";
  check("health endpoint responds", health.status === 200);
  check("CSP defaults to 'none'", csp.includes("default-src 'none'"), csp.slice(0, 60));
  check("frame-ancestors 'none' (clickjacking)", csp.includes("frame-ancestors 'none'"));
  check("X-Content-Type-Options: nosniff", health.headers.get("x-content-type-options") === "nosniff");
  check("X-Frame-Options: DENY", health.headers.get("x-frame-options") === "DENY");
  check("Referrer-Policy: no-referrer", health.headers.get("referrer-policy") === "no-referrer");
  check("X-Powered-By removed", health.headers.get("x-powered-by") === null);

  const notFound = await probe.req("GET", "/api/definitely-not-a-route");
  check(
    "unknown route returns JSON 404 (no HTML error page)",
    notFound.status === 404 && (notFound.headers.get("content-type") || "").includes("application/json")
  );

  const traversal = await probe.req("GET", "/../../../../etc/passwd");
  check(
    "path traversal attempt does not leak a file",
    traversal.status === 404 || traversal.status === 400,
    `status ${traversal.status}`
  );

  // ─── 2. CSRF ────────────────────────────────────────────
  section("CSRF protection");
  const noToken = new Client(base);
  const r1 = await noToken.req("POST", "/api/admin/login", {
    body: { username: "admin", password: "AdminPass123" }
  });
  check("login without CSRF token is rejected", r1.status === 403, `status ${r1.status}`);

  const wrongToken = new Client(base);
  await wrongToken.csrf();
  const r2 = await wrongToken.req("POST", "/api/admin/login", {
    body: { username: "admin", password: "AdminPass123" },
    headers: { "X-CSRF-Token": "a".repeat(64) }
  });
  check("login with a forged CSRF token is rejected", r2.status === 403, `status ${r2.status}`);

  const evilOrigin = new Client(base);
  await evilOrigin.csrf();
  const r3 = await evilOrigin.req("POST", "/api/admin/login", {
    body: { username: "admin", password: "AdminPass123" },
    csrf: true,
    headers: { Origin: "https://evil.example" }
  });
  check("mutation from a foreign Origin is rejected", r3.status === 403, `status ${r3.status}`);

  const formClient = new Client(base);
  await formClient.csrf();
  const r4 = await formClient.req("POST", "/api/admin/login", {
    rawBody: "username=admin&password=AdminPass123",
    csrf: true,
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  });
  check(
    "HTML-form (urlencoded) login is refused outright",
    r4.status >= 400 && r4.status < 500,
    `status ${r4.status}`
  );

  const adminClient = new Client(base);
  const login = await adminClient.login("admin", "admin", "AdminPass123");
  check("legitimate login with token + allowed Origin succeeds", login.status === 200, `status ${login.status}`);
  const loginCookies = setCookieHeaders(login).join(" | ").toLowerCase();
  check("login sets the access cookie", loginCookies.includes("at="));
  check("access cookie is HttpOnly", loginCookies.includes("httponly"));
  check("access cookie carries SameSite", loginCookies.includes("samesite="));

  // ─── 3. NoSQL / operator injection ──────────────────────
  section("NoSQL injection");
  const nosql = new Client(base);
  await nosql.csrf();
  const inj1 = await nosql.req("POST", "/api/admin/login", {
    body: { username: { $ne: null }, password: { $ne: null } },
    csrf: true
  });
  check("operator object in username is rejected", inj1.status === 400, `status ${inj1.status}`);
  const inj2 = await nosql.req("POST", "/api/admin/login", {
    body: { username: { $gt: "" }, password: { $gt: "" } },
    csrf: true
  });
  check("$gt operator login attempt is rejected", inj2.status === 400, `status ${inj2.status}`);
  const inj3 = await adminClient.req("POST", "/api/admin/menu/delete", {
    body: { id: { $ne: null } },
    csrf: true
  });
  check("operator object in an id field is rejected", inj3.status === 400, `status ${inj3.status}`);

  // ─── 4. JWT forgery ─────────────────────────────────────
  section("JWT forgery");
  const managerClient = new Client(base);
  const managerLogin = await managerClient.login("manager", "manager", "ManagerPass123");
  check("manager login works", managerLogin.status === 200, `status ${managerLogin.status}`);
  const managerToken = managerClient.rawCookie("at");
  check("manager holds an access token", Boolean(managerToken));

  const [header, payload, signature] = String(managerToken).split(".");
  const decodedPayload = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));

  const escalated = `${header}.${Buffer.from(
    JSON.stringify({ ...decodedPayload, role: "admin" })
  ).toString("base64url")}.${signature}`;
  const tampered = await new Client(base).req("GET", "/api/admin/dashboard", {
    headers: { Cookie: `at=${escalated}` }
  });
  check("privilege escalation by editing the payload fails", tampered.status === 401, `status ${tampered.status}`);

  const noneHeader = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const noneToken = `${noneHeader}.${Buffer.from(
    JSON.stringify({ ...decodedPayload, role: "admin" })
  ).toString("base64url")}.`;
  const algNone = await new Client(base).req("GET", "/api/admin/dashboard", {
    headers: { Cookie: `at=${noneToken}` }
  });
  check("alg:none token is rejected", algNone.status === 401, `status ${algNone.status}`);

  const foreignToken = jwt.sign(
    { sub: decodedPayload.sub, role: "admin", tv: 0, aud: decodedPayload.aud, iss: decodedPayload.iss },
    "not-the-real-secret-not-the-real-secret",
    { expiresIn: 900 }
  );
  const wrongSecret = await new Client(base).req("GET", "/api/admin/dashboard", {
    headers: { Cookie: `at=${foreignToken}` }
  });
  check("token signed with another secret is rejected", wrongSecret.status === 401, `status ${wrongSecret.status}`);

  const expiredToken = jwt.sign(
    { sub: decodedPayload.sub, role: "admin", tv: 0, aud: decodedPayload.aud, iss: decodedPayload.iss },
    process.env.JWT_SECRET,
    { expiresIn: -60 }
  );
  const expired = await new Client(base).req("GET", "/api/admin/dashboard", {
    headers: { Cookie: `at=${expiredToken}` }
  });
  check("expired token is rejected", expired.status === 401, `status ${expired.status}`);

  const managerOnAdmin = await managerClient.req("GET", "/api/admin/dashboard");
  check("manager cannot reach admin routes", managerOnAdmin.status === 401, `status ${managerOnAdmin.status}`);
  const adminOnManager = await adminClient.req("GET", "/api/manager/orders");
  check("admin cannot reach manager routes", adminOnManager.status === 401, `status ${adminOnManager.status}`);
  const anonymous = await new Client(base).req("GET", "/api/admin/dashboard");
  check("anonymous request to a protected route is rejected", anonymous.status === 401);

  // ─── 5. Refresh-token rotation and replay ───────────────
  section("Refresh token rotation");
  const rotator = new Client(base);
  await rotator.login("manager", "manager", "ManagerPass123");
  const firstRefresh = rotator.rawCookie("rt");
  const rotated = await rotator.req("POST", "/api/auth/refresh", { csrf: true });
  const secondRefresh = rotator.rawCookie("rt");
  check("refresh succeeds", rotated.status === 200, `status ${rotated.status}`);
  check("refresh token is rotated on use", Boolean(firstRefresh) && firstRefresh !== secondRefresh);

  const replayer = new Client(base);
  await replayer.csrf();
  const replay = await replayer.req("POST", "/api/auth/refresh", {
    csrf: true,
    headers: { Cookie: `rt=${firstRefresh}` }
  });
  check("replaying a used refresh token is rejected", replay.status === 401, `status ${replay.status}`);

  const family = await rotator.req("POST", "/api/auth/refresh", { csrf: true });
  check(
    "replay detection also revokes the live token family",
    family.status === 401,
    `status ${family.status}`
  );

  // ─── 6. Server-side pricing ─────────────────────────────
  section("Server-side pricing");
  const customer = new Client(base);
  await customer.csrf();
  const book = await customer.req("POST", "/api/bookTable", {
    body: { name: "Alice", tableNumber: 1 },
    csrf: true
  });
  check("table booking works", book.status === 200, `status ${book.status}`);

  const tamperedCart = await customer.req("POST", "/api/cart/add", {
    body: { menuItemId: paneerId, quantity: 2, price: 1, totalPrice: 2 },
    csrf: true
  });
  check(
    "client-supplied price is ignored (2 x ₹500 = ₹1000)",
    tamperedCart.status === 200 && tamperedCart.json && tamperedCart.json.grandTotal === 1000,
    `grandTotal ${tamperedCart.json && tamperedCart.json.grandTotal}`
  );

  const legacy = await customer.req("POST", "/api/cart/add", {
    body: { item: "Paneer Tikka", price: 1 },
    csrf: true
  });
  check("legacy {item, price} payload is refused", legacy.status === 400, `status ${legacy.status}`);

  for (const qty of [0, -1, 51, 1e9]) {
    const bad = await customer.req("POST", "/api/cart/add", {
      body: { menuItemId: paneerId, quantity: qty },
      csrf: true
    });
    check(`quantity ${qty} is rejected`, bad.status === 400, `status ${bad.status}`);
  }

  // ─── 7. IDOR: orders are scoped to a table session ──────
  section("IDOR / session scoping");
  const checkout = await customer.req("POST", "/api/checkout", { csrf: true });
  check("checkout succeeds", checkout.status === 200, `status ${checkout.status}`);
  const aliceSession = customer.rawCookie("ts");

  const intruder = new Client(base);
  await intruder.csrf();
  const intruderBook = await intruder.req("POST", "/api/bookTable", {
    body: { name: "Bob", tableNumber: 2 },
    csrf: true
  });
  check("second diner books another table", intruderBook.status === 200, `status ${intruderBook.status}`);
  const intruderPayments = await intruder.req("GET", "/api/myPayments");
  check(
    "another diner cannot read the first diner's paid orders",
    intruderPayments.status === 200 &&
      Array.isArray(intruderPayments.json.tableOrders) &&
      intruderPayments.json.tableOrders.length === 0,
    `${intruderPayments.json && intruderPayments.json.tableOrders && intruderPayments.json.tableOrders.length} visible`
  );

  const staleCookie = await new Client(base).req("GET", "/api/cart", {
    headers: { Cookie: `ts=${aliceSession}` }
  });
  check("a still-valid session cookie reads its own cart", staleCookie.status === 200, `status ${staleCookie.status}`);

  // ─── 8. Booking and checkout races ──────────────────────
  section("Race conditions");
  const racerA = new Client(base);
  const racerB = new Client(base);
  await racerA.csrf();
  await racerB.csrf();
  const [raceA, raceB] = await Promise.all([
    racerA.req("POST", "/api/bookTable", { body: { name: "R1", tableNumber: 3 }, csrf: true }),
    racerB.req("POST", "/api/bookTable", { body: { name: "R2", tableNumber: 3 }, csrf: true })
  ]);
  const raceStatuses = [raceA.status, raceB.status].sort();
  check(
    "concurrent booking of one table yields exactly one winner",
    raceStatuses[0] === 200 && raceStatuses[1] === 409,
    raceStatuses.join("/")
  );

  const doublePay = new Client(base);
  await doublePay.csrf();
  await doublePay.req("POST", "/api/bookTable", { body: { name: "Carol", tableNumber: 5 }, csrf: true });
  await doublePay.req("POST", "/api/cart/add", { body: { menuItemId: paneerId, quantity: 2 }, csrf: true });
  const pays = await Promise.all([
    doublePay.req("POST", "/api/checkout", { csrf: true }),
    doublePay.req("POST", "/api/checkout", { csrf: true })
  ]);
  const payStatuses = pays.map((p) => p.status).sort();
  check(
    "concurrent checkout charges once",
    payStatuses[0] === 200 && payStatuses[1] === 409,
    payStatuses.join("/")
  );
  const doubleOrders = await dbi
    .collection("orders")
    .countDocuments({ tableNumber: 5, grandTotal: 1000 });
  check(
    "exactly one order was written for the doubled click",
    doubleOrders === 1,
    `${doubleOrders} orders for table 5`
  );

  // ─── 9. Mass assignment ─────────────────────────────────
  section("Mass assignment");
  const mass = new Client(base);
  await mass.csrf();
  const massBook = await mass.req("POST", "/api/bookTable", {
    body: { name: "Mallory", tableNumber: 4, isVacant: false, role: "admin", tableSessionId: "x" },
    csrf: true
  });
  const massSession = await mass.req("GET", "/api/admin/session");
  check(
    "extra fields on a booking do not create privileges",
    massBook.status === 200 && massSession.json && massSession.json.authenticated === false,
    `book ${massBook.status}, admin session ${massSession.json && massSession.json.authenticated}`
  );
  const ghost = new Client(base);
  await ghost.csrf();
  const ghostBook = await ghost.req("POST", "/api/bookTable", {
    body: { name: "Ghost", tableNumber: 99 },
    csrf: true
  });
  check("booking a non-existent table is refused", ghostBook.status === 409, `status ${ghostBook.status}`);

  // ─── 10. Prototype pollution ────────────────────────────
  section("Prototype pollution");
  const proto = new Client(base);
  await proto.csrf();
  const protoRes = await proto.req("POST", "/api/admin/login", {
    body: JSON.parse('{"__proto__":{"role":"admin"},"username":"admin","password":"nope"}'),
    csrf: true
  });
  check("__proto__ payload does not authenticate", protoRes.status === 401, `status ${protoRes.status}`);
  check("global Object.prototype was not polluted", ({}).role === undefined);

  // ─── 11. Body size and malformed input ──────────────────
  section("Body limits");
  const big = new Client(base);
  await big.csrf();
  const huge = await big.req("POST", "/api/admin/login", {
    rawBody: JSON.stringify({ username: "admin", password: "x".repeat(200 * 1024) }),
    csrf: true
  });
  check("200 KB body is rejected", huge.status === 413, `status ${huge.status}`);

  const malformed = await new Client(base).req("POST", "/api/admin/login", {
    rawBody: "{not json",
    headers: { "Content-Type": "application/json" }
  });
  check("malformed JSON returns 400, not a stack trace", malformed.status === 400, `status ${malformed.status}`);

  // ─── 12. CORS ───────────────────────────────────────────
  section("CORS");
  const cors = await new Client(base).req("GET", "/api/menu", {
    headers: { Origin: "https://evil.example" }
  });
  check("foreign Origin gets no ACAO header", cors.headers.get("access-control-allow-origin") === null);
  const allowed = await new Client(base).req("GET", "/api/menu", {
    headers: { Origin: "http://localhost:3000" }
  });
  check(
    "configured Origin is allowed",
    allowed.headers.get("access-control-allow-origin") === "http://localhost:3000"
  );

  // ─── 13. XSS payload storage ────────────────────────────
  section("XSS");
  const xssPayload = '<script>alert(1)</script><img src=x onerror=alert(2)>';
  const xssCreate = await adminClient.req("POST", "/api/admin/menu", {
    body: { name: xssPayload, price: 10 },
    csrf: true
  });
  check("menu item with an XSS payload is stored as data", xssCreate.status === 200, `status ${xssCreate.status}`);
  const menuRead = await new Client(base).req("GET", "/api/menu");
  const menuType = menuRead.headers.get("content-type") || "";
  check("menu endpoint never serves HTML", menuType.includes("application/json"), menuType);
  check("stored payload is returned JSON-encoded, not HTML", menuRead.text.includes("<script>"));
  const menuCsp = menuRead.headers.get("content-security-policy") || "";
  check("even a direct hit to the API cannot execute scripts", menuCsp.includes("default-src 'none'"));

  // ─── 14. Revocable sessions ─────────────────────────────
  section("Revocation");
  const doomedHash = await bcrypt.hash("DoomedPass123", 10);
  const doomedInsert = await dbi
    .collection("managers")
    .insertOne({ username: "doomed", password: doomedHash, tokenVersion: 0 });
  const doomed = new Client(base);
  const doomedLogin = await doomed.login("manager", "doomed", "DoomedPass123");
  const beforeDelete = await doomed.req("GET", "/api/manager/orders");
  await dbi.collection("managers").deleteOne({ _id: doomedInsert.insertedId });
  const afterDelete = await doomed.req("GET", "/api/manager/orders");
  check(
    "deleting a manager revokes their live token immediately",
    doomedLogin.status === 200 && beforeDelete.status === 200 && afterDelete.status === 401,
    `${beforeDelete.status} -> ${afterDelete.status}`
  );

  // ─── 15. AI analytics uses real data ────────────────────
  section("AI analytics");
  const orders = await dbi.collection("orders").find({}).toArray();
  const weekCutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const realWeekRevenue = round2(
    orders
      .filter((o) => new Date(o.orderedAt).getTime() > weekCutoff)
      .reduce((sum, o) => sum + (Number(o.grandTotal) || 0), 0)
  );
  const analysis = await adminClient.req("GET", "/api/admin/ai-analysis");
  const reported = analysis.json && analysis.json.currentWeek && analysis.json.currentWeek.week_revenue;
  check("AI analysis returns real weekly revenue", reported === realWeekRevenue, `reported ${reported}, DB ${realWeekRevenue}`);
  check("hard-coded demo constants are gone", reported !== 275000);
  check(
    "AI branch degrades gracefully when the service is down",
    analysis.json && analysis.json.available === false && typeof analysis.json.basis === "string"
  );
  check(
    "history has four previous weeks",
    analysis.json && Array.isArray(analysis.json.history) && analysis.json.history.length === 4
  );

  // ─── 16. Login brute-force limit (last: it poisons the limiter) ─
  section("Rate limiting");
  const brute = new Client(base);
  await brute.csrf();
  let saw429 = false;
  let attempts = 0;
  for (let i = 0; i < 15 && !saw429; i += 1) {
    const res = await brute.req("POST", "/api/admin/login", {
      body: { username: "admin", password: `wrong-${i}` },
      csrf: true
    });
    attempts += 1;
    if (res.status === 429) saw429 = true;
  }
  check("repeated failed logins are throttled", saw429, `429 after ${attempts} attempts`);

  // ─── Summary ────────────────────────────────────────────
  const failed = results.filter((r) => !r.ok);
  console.log(`\n${"═".repeat(64)}`);
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) {
    console.log("\nFAILED:");
    for (const f of failed) console.log(`  ✗ ${f.name} ${f.detail ? `(${f.detail})` : ""}`);
  }

  server.close();
  await dbModule.closeDb();
  await mongo.stop();
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error("Suite crashed:", error);
  process.exit(1);
});
