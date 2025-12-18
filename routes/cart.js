const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

// Add to cart
router.post('/add', async(req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qty = parseInt(quantity) || 1;

        // Get product details
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).redirect('/products');
        }

        // Initialize cart if it doesn't exist
        if (!req.session.cart) {
            req.session.cart = {};
        }

        // Add or update product in cart
        if (req.session.cart[productId]) {
            req.session.cart[productId].quantity += qty;
        } else {
            req.session.cart[productId] = {
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: qty
            };
        }

        res.redirect('/cart');
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.redirect('/products');
    }
});

// View cart
router.get('/', (req, res) => {
    const cart = req.session.cart || {};
    let total = 0;
    const cartItems = [];

    for (const [id, item] of Object.entries(cart)) {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        cartItems.push({
            id,
            ...item,
            subtotal
        });
    }

    res.render('cart', {
        title: 'Shopping Cart',
        page: 'cart',
        cartItems,
        total: total.toFixed(2)
    });
});

// Remove from cart
router.post('/remove/:id', (req, res) => {
    const { id } = req.params;
    if (req.session.cart && req.session.cart[id]) {
        delete req.session.cart[id];
    }
    res.redirect('/cart');
});

// Update quantity
router.post('/update/:id', (req, res) => {
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = parseInt(quantity);

    if (req.session.cart && req.session.cart[id]) {
        if (qty <= 0) {
            delete req.session.cart[id];
        } else {
            req.session.cart[id].quantity = qty;
        }
    }
    res.redirect('/cart');
});

// Checkout
router.post('/checkout', async(req, res) => {
    try {
        // Validate that cart exists and has items
        if (!req.session.cart || Object.keys(req.session.cart).length === 0) {
            return res.redirect('/cart');
        }

        // Get form data
        const {
            fullName,
            phone,
            address,
            city,
            email,
            notes,
            payment
        } = req.body;

        // Calculate total
        let total = 0;
        const items = [];

        for (const [id, item] of Object.entries(req.session.cart)) {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            items.push({
                productId: id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            });
        }

        // Generate order number
        const orderNumber = 'ORD-' + Date.now();

        // Create and save order to database
        const order = new Order({
            orderNumber,
            customerName: fullName || 'Guest',
            email: email || 'noemail@example.com',
            phone,
            address,
            city,
            items,
            total,
            paymentMethod: payment || 'cod',
            notes,
            status: 'pending'
        });

        await order.save();

        // Store order in session for success page
        req.session.lastOrder = {
            orderNumber,
            total,
            customerName: fullName || 'Guest'
        };

        // Clear the cart
        req.session.cart = {};

        console.log('Order saved:', {
            orderNumber,
            customerName: fullName,
            email,
            total
        });

        res.redirect('/success');
    } catch (error) {
        console.error('Checkout error:', error);
        res.redirect('/checkout');
    }
});

module.exports = router;