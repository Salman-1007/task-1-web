const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order'); // Moved to top for consistency

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
            filter.$or = [
                { name: { $regex: req.query.search, $options: 'i' } },
                { description: { $regex: req.query.search, $options: 'i' } }
            ];
        }

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);
        const products = await Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
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
        if (!req.session.userId) {
            return res.render('orders', {
                title: 'My Orders',
                page: 'orders',
                orders: [],
                user: null,
                message: 'Please login to view your orders.'
            });
        }

        // 2. CRITICAL FIX: Only find orders belonging to this specific user ID
        const orders = await Order.find({ userId: req.session.userId }).sort({ createdAt: -1 });

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

module.exports = router;