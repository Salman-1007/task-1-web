const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { isLoggedIn } = require('../middleware/auth');

// SHOW USER ORDERS
router.get('/orders', isLoggedIn, async(req, res) => {
    const orders = await Order.find({
        userId: req.session.user._id
    }).sort({ createdAt: -1 });

    res.render('orders', {
        title: 'My Orders',
        orders,
        user: req.session.user
    });
});

// DELETE ORDER (USER ONLY)
router.post('/orders/delete/:id', isLoggedIn, async(req, res) => {
    try {
        const orderId = req.params.id;

        // IMPORTANT: user can delete ONLY their own order
        await Order.deleteOne({
            _id: orderId,
            userId: req.session.user._id
        });

        res.redirect('/orders');
    } catch (err) {
        console.error(err);
        res.redirect('/orders');
    }
});

module.exports = router;