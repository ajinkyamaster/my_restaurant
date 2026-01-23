async function addToCart(itemName, itemPrice) {
    try {
        const response = await fetch("/cart/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                item: itemName,
                quantity: 1,
                price: itemPrice
            })
        });

        const data = await response.json();

        // 🔴 HANDLE NO TABLE SESSION
        if (data.redirect) {
            window.location.href = data.redirect;
            return;
        }

        if (!response.ok) {
            alert("Unable to add item to cart");
            return;
        }

        // ✅ DOM updates
        const preview = document.getElementById("menu-cart-preview");
        const list = document.getElementById("cart-preview-list");

        if (!preview || !list) return;

        preview.style.display = "block";
        list.innerHTML = "";

        data.cart.forEach(ci => {
            const li = document.createElement("li");

            const nameSpan = document.createElement("span");
            nameSpan.innerText = `${ci.item} × ${ci.quantity}`;

            const priceSpan = document.createElement("span");
            priceSpan.innerText = `₹ ${ci.totalPrice}`;

            li.appendChild(nameSpan);
            li.appendChild(priceSpan);

            list.appendChild(li);
        });

    } catch (err) {
        console.error("Add to cart failed", err);
        alert("Something went wrong");
    }
}
