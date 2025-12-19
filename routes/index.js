const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order'); // Moved to top for consistency
const {
    buildOrderSummary
} = require('./orderSummary');
const applyDiscount = require('../middleware/applyDiscount');
const {
    isLoggedIn
} = require('../middleware/auth');

// Home page route
router.get('/', (req, res) => {
    res.render('home', {
        title: 'Home',
        page: 'home',
        user: req.session.user || null
    });
});

// Products listing page with pagination and filters
router.get('/products', async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter = {};
        if (req.query.category && req.query.category !== 'all') {
            filter.category = req.query.category;
        }

        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) filter.price.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice) filter.price.$lte = parseFloat(req.query.maxPrice);
        }

        if (req.query.search) {
            filter.$or = [{
                    name: {
                        $regex: req.query.search,
                        $options: 'i'
                    }
                },
                {
                    description: {
                        $regex: req.query.search,
                        $options: 'i'
                    }
                }
            ];
        }

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);
        const products = await Product.find(filter).sort({
            createdAt: -1
        }).skip(skip).limit(limit);
        const categories = await Product.distinct('category');

        res.render('products', {
            title: 'Products',
            page: 'products',
            products,
            categories,
            currentPage: page,
            totalPages,
            totalProducts,
            limit,
            user: req.session.user || null,
            filters: {
                category: req.query.category || 'all',
                minPrice: req.query.minPrice || '',
                maxPrice: req.query.maxPrice || '',
                search: req.query.search || ''
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        // FIX: Passing status and message to prevent EJS crash
        res.status(500).render('error', {
            title: 'Error',
            status: 500,
            message: 'Failed to load products. Please check your database connection.'
        });
    }
});

// Orders page route (FILTERED BY USER)
router.get('/orders', async(req, res) => {
    try {
        // 1. Check if user is logged in
        if (!req.session.user) {
            return res.render('orders', {
                title: 'My Orders',
                page: 'orders',
                orders: [],
                user: null,
                message: 'Please login to view your orders.'
            });
        }

        // 2. Only find orders belonging to this specific user ID
        const orders = await Order.find({
            userId: req.session.user.id
        }).sort({
            createdAt: -1
        });

        res.render('orders', {
            title: 'My Orders',
            page: 'orders',
            orders,
            user: req.session.user
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).render('error', {
            title: 'Error',
            status: 500,
            message: 'Could not retrieve orders.'
        });
    }
});

// ORDER PREVIEW STEP
router.get('/order/preview', isLoggedIn, (req, res, next) => {
    // Ensure we have a summary either from checkout step or directly from the cart
    const sessionSummary = req.session.orderSummary;
    const cart = req.session.cart || {};

    req.orderSummary = sessionSummary || buildOrderSummary(cart);

    // Also attach any stored checkout form data (shipping info, etc.)
    res.locals.checkoutForm = req.session.checkoutForm || {};

    next();
}, applyDiscount, (req, res) => {
    const summary = req.orderSummary;

    res.render('order-preview', {
        title: 'Order Preview',
        page: 'order-preview',
        cartItems: summary.items,
        subtotal: summary.subtotal,
        shipping: summary.shipping,
        tax: summary.tax,
        total: summary.total,
        discountAmount: summary.discountAmount,
        totalAfterDiscount: summary.totalAfterDiscount,
        couponApplied: summary.couponApplied,
        coupon: summary.coupon || '',
        user: req.session.user || null
    });
});

// FINALIZE ORDER AFTER PREVIEW CONFIRMATION
router.post('/order/confirm', isLoggedIn, (req, res, next) => {
    // Start from the session summary so values match what user saw on preview
    const sessionSummary = req.session.orderSummary;
    const cart = req.session.cart || {};

    req.orderSummary = sessionSummary || buildOrderSummary(cart);

    // Merge latest coupon from form (applyDiscount will re-evaluate)
    next();
}, applyDiscount, async(req, res) => {
    try {
        const summary = req.orderSummary;

        if (!summary || !summary.items || summary.items.length === 0) {
            return res.redirect('/cart');
        }

        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const checkoutForm = req.session.checkoutForm || {};
        const user = req.session.user;

        const finalTotal = summary.totalAfterDiscount || summary.total;

        const itemsForOrder = summary.items.map(item => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
        }));

        const order = new Order({
            orderNumber: 'ORD-' + Date.now(),
            userId: user.id,
            customerName: checkoutForm.fullName || user.name,
            email: checkoutForm.email || user.email,
            phone: checkoutForm.phone || '',
            address: checkoutForm.address || 'Address not provided',
            city: checkoutForm.city || '',
            items: itemsForOrder,
            total: finalTotal,
            paymentMethod: checkoutForm.payment || 'cod',
            notes: checkoutForm.notes || '',
            status: 'Placed'
        });

        const savedOrder = await order.save();

        // Save last order for success page and clear cart + temporary data
        req.session.lastOrder = savedOrder;
        req.session.cart = {};
        req.session.orderSummary = null;
        req.session.checkoutForm = null;

        req.session.save(() => {
            res.redirect('/success');
        });
    } catch (error) {
        console.error('Finalize order error:', error);
        res.redirect('/cart/checkout');
    }
});

// SUCCESS PAGE ROUTE
router.get('/success', (req, res) => {
    const orderData = req.session.lastOrder;

    const displayOrder = orderData || {
        customerName: "Valued Customer",
        email: "Check your email",
        orderNumber: "ORD-REFRESHED",
        total: 0,
        address: "Address on file",
        city: ""
    };

    res.render('success', {
        title: 'Order Success',
        page: 'success',
        order: displayOrder,
        user: req.session.user || null
    });
});

// TASK 3: CUSTOMER ORDER HISTORY BY EMAIL
router.get('/my-orders', (req, res) => {
    res.render('my-orders', {
        title: 'My Orders',
        page: 'my-orders'
    });
});

router.post('/my-orders', async(req, res) => {
    try {
        const email = (req.body.email || '').trim();
        let orders = [];

        if (email) {
            orders = await Order.find({
                email
            }).sort({
                createdAt: -1
            });
        }

        res.render('my-orders', {
            title: 'My Orders',
            page: 'my-orders',
            orders,
            searchEmail: email
        });
    } catch (error) {
        console.error('Error fetching orders by email:', error);
        res.render('my-orders', {
            title: 'My Orders',
            page: 'my-orders',
            orders: [],
            searchEmail: req.body.email || '',
            error: 'Could not retrieve orders. Please try again.'
        });
    }
});

module.exports = router;