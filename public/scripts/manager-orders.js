async function acceptOrder(orderId) {
    try {
        const response = await fetch("/manager/acceptOrder", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ orderId })
        });

        const data = await response.json();

        if (data.success) {
            const orderDiv = document.getElementById(`order-${orderId}`);
            orderDiv.innerHTML = `<span class="order-confirmed">✅ Order Confirmed!</span>`;
        }
    } catch (err) {
        console.error("Failed to accept order", err);
    }
}
