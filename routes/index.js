const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Home page route
router.get('/', (req, res) => {
    res.render('home', {
        title: 'Home',
        page: 'home'
    });
});

// Products listing page with pagination and filters
router.get('/products', async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Build filter object
        const filter = {};

        // Category filter
        if (req.query.category && req.query.category !== 'all') {
            filter.category = req.query.category;
        }

        // Price range filter
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {};
            if (req.query.minPrice) {
                filter.price.$gte = parseFloat(req.query.minPrice);
            }
            if (req.query.maxPrice) {
                filter.price.$lte = parseFloat(req.query.maxPrice);
            }
        }

        // Search filter
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

        // Get total count for pagination
        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        // Fetch products with filters and pagination
        const products = await Product.find(filter)
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit);

        // Get unique categories for filter dropdown
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
            filters: {
                category: req.query.category || 'all',
                minPrice: req.query.minPrice || '',
                maxPrice: req.query.maxPrice || '',
                search: req.query.search || ''
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).render('error', {
            title: 'Error',
            message: 'Failed to load products. Please try again later.'
        });
    }
});

// Checkout page route
router.get('/checkout', (req, res) => {
    res.render('checkout', {
        title: 'Checkout',
        page: 'checkout'
    });
});

// Orders/CRUD page route
router.get('/orders', async(req, res) => {
    try {
        const Order = require('../models/Order');
        const orders = await Order.find({}).sort({ createdAt: -1 });

        res.render('orders', {
            title: 'My Orders',
            page: 'orders',
            orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.render('orders', {
            title: 'My Orders',
            page: 'orders',
            orders: []
        });
    }
});

// Success page route (for checkout completion)
router.get('/success', (req, res) => {
    res.render('success', {
        title: 'Order Success',
        page: 'success'
    });
});

module.exports = router;