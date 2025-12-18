const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Account page - shows logged in user info
router.get('/account', (req, res) => {
    res.render('account', {
        title: 'My Account',
        page: 'account',
        user: req.session.user || null,
        isLoggedIn: !!req.session.user
    });
});

// Customer Signup
router.get('/signup', (req, res) => {
    res.render('signup', {
        title: 'Sign Up',
        page: 'signup'
    });
});

router.post('/signup', async(req, res) => {
    try {
        const { username, email, password, confirmPassword, fullName } = req.body;

        // Validate input
        if (!username || !email || !password || !confirmPassword) {
            return res.status(400).render('signup', {
                title: 'Sign Up',
                page: 'signup',
                error: 'All fields are required'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).render('signup', {
                title: 'Sign Up',
                page: 'signup',
                error: 'Passwords do not match'
            });
        }

        // Check if user already exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).render('signup', {
                title: 'Sign Up',
                page: 'signup',
                error: 'User already exists with that email or username'
            });
        }

        // Create new customer user
        user = new User({
            username,
            email,
            password,
            fullName,
            isAdmin: false
        });

        await user.save();

        // Store in session
        req.session.user = {
            id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            isAdmin: user.isAdmin
        };

        res.redirect('/auth/account');
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).render('signup', {
            title: 'Sign Up',
            page: 'signup',
            error: 'An error occurred during signup'
        });
    }
});

// Customer Login
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Login',
        page: 'login'
    });
});

router.post('/login', async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render('login', {
                title: 'Login',
                page: 'login',
                error: 'Please provide email and password'
            });
        }

        // Find user and select password field
        const user = await User.findOne({ email }).select('+password');

        if (!user || user.isAdmin) {
            return res.status(401).render('login', {
                title: 'Login',
                page: 'login',
                error: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordCorrect = await user.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).render('login', {
                title: 'Login',
                page: 'login',
                error: 'Invalid email or password'
            });
        }

        // Store user in session
        req.session.user = {
            id: user._id,
            email: user.email,
            username: user.username,
            fullName: user.fullName,
            isAdmin: user.isAdmin
        };

        res.redirect('/auth/account');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).render('login', {
            title: 'Login',
            page: 'login',
            error: 'An error occurred during login'
        });
    }
});

// Admin Login
router.get('/admin-login', (req, res) => {
    res.render('admin-login', {
        title: 'Admin Login',
        page: 'admin-login'
    });
});

router.post('/admin-login', async(req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).render('admin-login', {
                title: 'Admin Login',
                page: 'admin-login',
                error: 'Please provide email and password'
            });
        }

        // Find admin user and select password field
        const admin = await User.findOne({ email, isAdmin: true }).select('+password');

        if (!admin) {
            return res.status(401).render('admin-login', {
                title: 'Admin Login',
                page: 'admin-login',
                error: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordCorrect = await admin.comparePassword(password);

        if (!isPasswordCorrect) {
            return res.status(401).render('admin-login', {
                title: 'Admin Login',
                page: 'admin-login',
                error: 'Invalid email or password'
            });
        }

        // Store admin in session
        req.session.user = {
            id: admin._id,
            email: admin.email,
            username: admin.username,
            fullName: admin.fullName,
            isAdmin: admin.isAdmin
        };

        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).render('admin-login', {
            title: 'Admin Login',
            page: 'admin-login',
            error: 'An error occurred during admin login'
        });
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.user = null;
    res.redirect('/');
});

module.exports = router;