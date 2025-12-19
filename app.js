require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/database');

connectDB();
const app = express();

// VIEW ENGINE
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MIDDLEWARES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// SESSION - must come BEFORE routes
app.use(session({
    secret: 'webdev_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// STATIC FILES
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// GLOBAL VARIABLES - must come AFTER session, BEFORE routes
app.use((req, res, next) => {
    res.locals.cart = req.session.cart || { items: [] };
    res.locals.user = req.session.user || null;
    next();
});

// ROUTES - after session & globals
const routes = require('./routes/index'); // your main routes
const cartRoutes = require('./routes/cart');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth'); // must exist

app.use('/', routes);
app.use('/cart', cartRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes); // login/register routes

// 404 HANDLER - last
app.use((req, res) => {
    res.status(404).render('404', { title: 'Page Not Found' });
});

module.exports = app;