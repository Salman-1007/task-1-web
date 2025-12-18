require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// Middleware to expose cart data to views
app.use((req, res, next) => {
    if (!req.session.cart) {
        req.session.cart = {};
    }
    res.locals.cartCount = Object.keys(req.session.cart).length;
    res.locals.cart = req.session.cart;
    next();
});

// Serve static files (CSS, JS, images)
app.use('/css', express.static(path.join(__dirname, 'public', 'css')));
app.use('/js', express.static(path.join(__dirname, 'public', 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Routes
const routes = require('./routes');
const adminRoutes = require('./routes/admin');

app.use('/', routes);
app.use('/admin', adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('404', {
        title: 'Page Not Found'
    });
});

module.exports = app;