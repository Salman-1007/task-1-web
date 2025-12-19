const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Helper: allowed status flow
const STATUS_FLOW = ['Placed', 'Processing', 'Delivered'];

// List all orders for admin with basic info and status controls
router.get('/', async(req, res) => {
    try {
        const orders = await Order.find().sort({
            createdAt: -1
        });

        res.render('admin/orders', {
            title: 'Orders',
            page: 'orders',
            orders,
            STATUS_FLOW
        });
    } catch (error) {
        console.error('Error loading admin orders:', error);
        res.status(500).render('admin/error', {
            title: 'Error',
            page: 'error',
            message: 'Failed to load orders.'
        });
    }
});

// Advance order status one step (no skipping)
router.post('/:id/next-status', async(req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.redirect('/admin/orders');
        }

        const currentIndex = STATUS_FLOW.indexOf(order.status);
        if (currentIndex === -1) {
            // If status is unknown (old data), reset to first state
            order.status = STATUS_FLOW[0];
        } else if (currentIndex < STATUS_FLOW.length - 1) {
            // Move to the next state only (no skipping)
            order.status = STATUS_FLOW[currentIndex + 1];
        }

        await order.save();
        res.redirect('/admin/orders');
    } catch (error) {
        console.error('Error updating order status:', error);
        res.redirect('/admin/orders');
    }
});

module.exports = router;