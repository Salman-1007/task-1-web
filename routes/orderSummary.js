// Utility to build a normalized order summary from the session cart
// This keeps the pricing logic reusable for preview and final order placement.

function buildOrderSummary(cart = {}) {
    let subtotal = 0;
    const items = [];

    for (const [id, item] of Object.entries(cart)) {
        const quantity = item.quantity || 1;
        const price = Number(item.price) || 0;
        const lineTotal = price * quantity;

        subtotal += lineTotal;
        items.push({
            id,
            name: item.name,
            price,
            quantity,
            image: item.image,
            lineTotal
        });
    }

    const shipping = subtotal > 5000 ? 0 : 150;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + shipping + tax;

    return {
        items,
        subtotal,
        shipping,
        tax,
        total
    };
}

module.exports = {
    buildOrderSummary
};