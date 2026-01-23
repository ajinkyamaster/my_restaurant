function recalculateGrandTotal() {
    let total = 0;
    document.querySelectorAll("[id^='item-total-']").forEach(el => {
        total += parseInt(el.innerText);
    });
    document.getElementById("grand-total").innerText = total;
}

async function updateCart(itemName, newQty, price) {
    await fetch("/cart/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            item: itemName,
            quantity: newQty,
            price
        })
    });
}

function increaseCount(itemName) {
    const row = document.querySelector(`tr[data-item="${itemName}"]`);
    const price = parseInt(row.dataset.price);

    const qtyInput = row.querySelector(".quantity-value");
    const itemTotalEl = row.querySelector("[id^='item-total-']");

    let qty = parseInt(qtyInput.value) + 1;
    qtyInput.value = qty;

    itemTotalEl.innerText = qty * price;
    recalculateGrandTotal();

    updateCart(itemName, qty, price);
}

function decreaseCount(itemName) {
    const row = document.querySelector(`tr[data-item="${itemName}"]`);
    const price = parseInt(row.dataset.price);

    const qtyInput = row.querySelector(".quantity-value");
    const itemTotalEl = row.querySelector("[id^='item-total-']");

    let qty = parseInt(qtyInput.value);
    if (qty <= 1) return;

    qty -= 1;
    qtyInput.value = qty;

    itemTotalEl.innerText = qty * price;
    recalculateGrandTotal();

    updateCart(itemName, qty, price);
}

async function removeItem(itemName) {
    await fetch("/cart/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item: itemName })
    });

    document.querySelector(`tr[data-item="${itemName}"]`).remove();
    recalculateGrandTotal();
}
