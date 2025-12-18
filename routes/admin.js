const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { isAdmin } = require('../middleware/auth');

// Protect all admin routes with isAdmin middleware
router.use(isAdmin);

// Admin Dashboard
router.get('/', async(req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalStock = await Product.aggregate([{
            $group: {
                _id: null,
                total: {
                    $sum: '$stock'
                }
            }
        }]);
        const lowStockProducts = await Product.countDocuments({
            stock: {
                $lt: 10
            }
        });
        const featuredProducts = await Product.countDocuments({
            featured: true
        });

        // Get products by category
        const productsByCategory = await Product.aggregate([{
                $group: {
                    _id: '$category',
                    count: {
                        $sum: 1
                    }
                }
            },
            {
                $sort: {
                    count: -1
                }
            }
        ]);

        // Get recent products
        const recentProducts = await Product.find()
            .sort({
                createdAt: -1
            })
            .limit(5)
            .select('name price stock createdAt');

        res.render('admin/dashboard', {
            title: 'Dashboard',
            page: 'dashboard',
            stats: {
                totalProducts,
                totalStock: totalStock[0] ? totalStock[0].total : 0,
                lowStockProducts,
                featuredProducts
            },
            productsByCategory,
            recentProducts
        });
    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.status(500).render('admin/error', {
            title: 'Error',
            page: 'error',
            message: 'Failed to load dashboard data.'
        });
    }
});

// Admin Products List
router.get('/products', async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Search filter
        const filter = {};
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

        // Category filter
        if (req.query.category && req.query.category !== 'all') {
            filter.category = req.query.category;
        }

        const totalProducts = await Product.countDocuments(filter);
        const totalPages = Math.ceil(totalProducts / limit);

        const products = await Product.find(filter)
            .sort({
                createdAt: -1
            })
            .skip(skip)
            .limit(limit);

        const categories = await Product.distinct('category');

        res.render('admin/products', {
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
                search: req.query.search || ''
            }
        });
    } catch (error) {
        console.error('Error loading products:', error);
        res.status(500).render('admin/error', {
            title: 'Error',
            page: 'error',
            message: 'Failed to load products.'
        });
    }
});

// Add Product - GET
router.get('/products/new', (req, res) => {
    res.render('admin/product-form', {
        title: 'Add New Product',
        page: 'add-product',
        product: null,
        categories: ['Electronics', 'Fashion', 'Home & Living', 'Health & Beauty', 'Sports & Gaming', 'Books & Media', 'Food & Beverages', 'Other']
    });
});

// Add Product - POST
router.post('/products/new', async(req, res) => {
    try {
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            price: parseFloat(req.body.price),
            category: req.body.category,
            image: req.body.image || '/images/placeholder.jpg',
            stock: parseInt(req.body.stock) || 0,
            rating: parseFloat(req.body.rating) || 0,
            reviews: parseInt(req.body.reviews) || 0,
            featured: req.body.featured === 'on' || req.body.featured === 'true'
        });

        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error creating product:', error);
        res.render('admin/product-form', {
            title: 'Add New Product',
            page: 'add-product',
            product: req.body,
            categories: ['Electronics', 'Fashion', 'Home & Living', 'Health & Beauty', 'Sports & Gaming', 'Books & Media', 'Food & Beverages', 'Other'],
            error: error.message
        });
    }
});

// Edit Product - GET
router.get('/products/:id/edit', async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('admin/error', {
                title: 'Not Found',
                message: 'Product not found.'
            });
        }

        res.render('admin/product-form', {
            title: 'Edit Product',
            page: 'edit-product',
            product,
            categories: ['Electronics', 'Fashion', 'Home & Living', 'Health & Beauty', 'Sports & Gaming', 'Books & Media', 'Food & Beverages', 'Other']
        });
    } catch (error) {
        console.error('Error loading product:', error);
        res.status(500).render('admin/error', {
            title: 'Error',
            page: 'error',
            message: 'Failed to load product.'
        });
    }
});

// Edit Product - POST
router.post('/products/:id/edit', async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).render('admin/error', {
                title: 'Not Found',
                message: 'Product not found.'
            });
        }

        product.name = req.body.name;
        product.description = req.body.description;
        product.price = parseFloat(req.body.price);
        product.category = req.body.category;
        product.image = req.body.image || '/images/placeholder.jpg';
        product.stock = parseInt(req.body.stock) || 0;
        product.rating = parseFloat(req.body.rating) || 0;
        product.reviews = parseInt(req.body.reviews) || 0;
        product.featured = req.body.featured === 'on' || req.body.featured === 'true';
        product.updatedAt = Date.now();

        await product.save();
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Error updating product:', error);
        res.render('admin/product-form', {
            title: 'Edit Product',
            page: 'edit-product',
            product: req.body,
            categories: ['Electronics', 'Fashion', 'Home & Living', 'Health & Beauty', 'Sports & Gaming', 'Books & Media', 'Food & Beverages', 'Other'],
            error: error.message
        });
    }
});

// Delete Product - POST
router.post('/products/:id/delete', async(req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }
        res.json({
            success: true,
            message: 'Product deleted successfully.'
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product.'
        });
    }
});

module.exports = router;