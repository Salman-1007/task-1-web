const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const { buildOrderSummary } = require('./orderSummary');

// 1. VIEW CART
router.get('/', (req, res) => {
    const cart = req.session.cart || {};
    let total = 0;
    const cartItems = [];

    for (const [id, item] of Object.entries(cart)) {
        const subtotal = item.price * item.quantity;
        total += subtotal;
        cartItems.push({ id, ...item, subtotal });
    }

    res.render('cart', {
        title: 'Shopping Cart',
        page: 'cart',
        cartItems,
        total: total.toFixed(2),
        user: req.session.user || null
    });
});

// 2. SHOW CHECKOUT PAGE (LOGIN REQUIRED)
router.get('/checkout', (req, res) => {
    if (!req.session.cart || Object.keys(req.session.cart).length === 0) {
        return res.redirect('/products');
    }

    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    const cart = req.session.cart;
    let subtotal = 0;
    const items = [];

    for (const [id, item] of Object.entries(cart)) {
        subtotal += item.price * item.quantity;
        items.push({ id, ...item });
    }

    const shipping = subtotal > 5000 ? 0 : 150;
    const tax = Math.round(subtotal * 0.05);
    const total = subtotal + shipping + tax;

    res.render('checkout', {
        title: 'Checkout',
        user: req.session.user,
        cart: {
            items,
            subtotal: subtotal.toFixed(2),
            shipping,
            tax: tax.toFixed(2),
            total: total.toFixed(2)
        }
    });
});

// 3. PROCESS CHECKOUT (STORE DATA, THEN REDIRECT TO ORDER PREVIEW)
router.post('/checkout', async(req, res) => {
    try {
        if (!req.session.cart || Object.keys(req.session.cart).length === 0) {
            return res.redirect('/cart');
        }

        if (!req.session.user) {
            return res.redirect('/auth/login');
        }

        const { fullName, phone, address, city, email, notes, payment } = req.body;

        // Build a reusable order summary from the current cart
        const summary = buildOrderSummary(req.session.cart || {});

        // Persist checkout form data and summary in the session for the preview step
        req.session.checkoutForm = {
            fullName,
            phone,
            address,
            city,
            email,
            notes,
            payment
        };
        req.session.orderSummary = summary;

        req.session.save(() => {
            // Redirect to the new Order Preview step
            res.redirect('/order/preview');
        });

    } catch (error) {
        console.error('Checkout error:', error);
        res.redirect('/cart/checkout');
    }
});

// 4. ADD TO CART
router.post('/add', async(req, res) => {
    try {
        const { productId, quantity } = req.body;
        const qty = parseInt(quantity) || 1;

        const product = await Product.findById(productId);
        if (!product) return res.redirect('/products');

        if (!req.session.cart) req.session.cart = {};

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
        console.error(error);
        res.redirect('/products');
    }
});

// 5. UPDATE QUANTITY
router.post('/update/:id', (req, res) => {
    const { id } = req.params;
    const qty = parseInt(req.body.quantity);

    if (req.session.cart && req.session.cart[id]) {
        if (qty <= 0) delete req.session.cart[id];
        else req.session.cart[id].quantity = qty;
    }
    res.redirect('/cart');
});

// 6. REMOVE FROM CART
router.post('/remove/:id', (req, res) => {
    const { id } = req.params;
    if (req.session.cart && req.session.cart[id]) {
        delete req.session.cart[id];
    }
    res.redirect('/cart');
});

module.exports = router;