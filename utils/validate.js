const { ValidationError } = require("./errors");

/**
 * Strict input validation.
 *
 * Design rules:
 *  - Never coerce objects into filters/ids (blocks NoSQL operator injection).
 *  - Never trust numbers that arrive as JSON strings unless explicitly allowed.
 *  - Reject control characters and cap every string length.
 */

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

function str(value, { field = "value", min = 1, max = 255, trim = true } = {}) {
    if (typeof value !== "string") {
        throw new ValidationError(`${field} must be a string`);
    }
    const out = trim ? value.trim() : value;
    if (out.length < min) {
        throw new ValidationError(`${field} must be at least ${min} character(s)`);
    }
    if (out.length > max) {
        throw new ValidationError(`${field} must be at most ${max} characters`);
    }
    if (CONTROL_CHARS.test(out)) {
        throw new ValidationError(`${field} contains invalid characters`);
    }
    return out;
}

function optionalStr(value, options = {}) {
    if (value === undefined || value === null || value === "") return null;
    return str(value, options);
}

/**
 * Integers only. Accepts a JSON number or a canonical numeric string
 * ("12", not "12abc" like parseInt would) so nothing silently becomes NaN.
 */
function int(value, { field = "value", min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER } = {}) {
    let n;
    if (typeof value === "number") {
        n = value;
    } else if (typeof value === "string" && /^-?\d+$/.test(value.trim())) {
        n = Number(value.trim());
    } else {
        throw new ValidationError(`${field} must be an integer`);
    }
    if (!Number.isSafeInteger(n)) {
        throw new ValidationError(`${field} must be an integer`);
    }
    if (n < min || n > max) {
        throw new ValidationError(`${field} must be between ${min} and ${max}`);
    }
    return n;
}

function boolean(value, { field = "value" } = {}) {
    if (typeof value === "boolean") return value;
    if (value === "true") return true;
    if (value === "false") return false;
    throw new ValidationError(`${field} must be a boolean`);
}

function objectId(value, { field = "id" } = {}) {
    if (typeof value !== "string" || !/^[a-fA-F0-9]{24}$/.test(value)) {
        throw new ValidationError(`${field} must be a valid id`);
    }
    return value;
}

function username(value, { field = "username" } = {}) {
    const out = str(value, { field, min: 3, max: 40 });
    if (!/^[a-zA-Z0-9._-]+$/.test(out)) {
        throw new ValidationError(`${field} may only contain letters, numbers, dot, dash and underscore`);
    }
    return out;
}

/**
 * Password rule for *creation*. Logins deliberately use `str` with a wide
 * range instead, so an old short password can still authenticate.
 */
function password(value, { field = "password" } = {}) {
    if (typeof value !== "string") {
        throw new ValidationError(`${field} must be a string`);
    }
    if (value.length < 8 || value.length > 128) {
        throw new ValidationError(`${field} must be between 8 and 128 characters`);
    }
    return value;
}

function loginPassword(value, { field = "password" } = {}) {
    return str(value, { field, min: 1, max: 200, trim: false });
}

function money(value, { field = "price", min = 0, max = 1000000 } = {}) {
    const n = typeof value === "number" ? value : Number(value);
    if (typeof value !== "number" && typeof value !== "string") {
        throw new ValidationError(`${field} must be a number`);
    }
    if (!Number.isFinite(n)) {
        throw new ValidationError(`${field} must be a number`);
    }
    if (n < min || n > max) {
        throw new ValidationError(`${field} must be between ${min} and ${max}`);
    }
    // Store money rounded to two decimal places.
    return Math.round(n * 100) / 100;
}

function enumValue(value, allowed, { field = "value" } = {}) {
    if (!allowed.includes(value)) {
        throw new ValidationError(`${field} must be one of: ${allowed.join(", ")}`);
    }
    return value;
}

module.exports = {
    str,
    optionalStr,
    int,
    boolean,
    objectId,
    username,
    password,
    loginPassword,
    money,
    enumValue
};
