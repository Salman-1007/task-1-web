const express = require('express');
const router = express.Router();

// Import route modules
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const cartRoutes = require('./routes/cart');

// Use route modules
router.use('/', indexRoutes);
router.use('/auth', authRoutes);
router.use('/cart', cartRoutes);

module.exports = router;