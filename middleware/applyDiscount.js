const { buildOrderSummary } = require('../routes/orderSummary');

/**
 * applyDiscount
 *
 * Reusable middleware that:
 * - Ensures an order summary exists for the current request
 * - Reads coupon code from query or form body
 * - Applies a 10% discount if coupon === 'SAVE10'
 * - Attaches the updated summary to req.orderSummary and res.locals.orderSummary
 *
 * This MUST run before an order is finally saved to MongoDB.
 */
function applyDiscount(req, res, next) {
    // Make sure we have a base order summary (from session or cart)
    let summary = req.orderSummary;

    if (!summary) {
        const cart = req.session.cart || {};
        summary = buildOrderSummary(cart);
    }

    // Read coupon from either query string or form input
    const coupon =
        (req.body && (req.body.coupon || req.body.couponCode)) ||
        (req.query && (req.query.coupon || req.query.couponCode)) ||
        null;

    summary.coupon = coupon || null;
    summary.discountAmount = 0;
    summary.totalAfterDiscount = summary.total;

    if (coupon && coupon.toUpperCase() === 'SAVE10') {
        const discount = Number((summary.total * 0.1).toFixed(2));
        summary.discountAmount = discount;
        summary.totalAfterDiscount = Number((summary.total - discount).toFixed(2));
        summary.couponApplied = true;
    } else {
        summary.couponApplied = false;
    }

    req.orderSummary = summary;
    res.locals.orderSummary = summary;

    // Also persist the summary in session so it can be reused on final confirmation
    req.session.orderSummary = summary;

    next();
}

module.exports = applyDiscount;