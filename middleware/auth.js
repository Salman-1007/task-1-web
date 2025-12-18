// Middleware to check if user is logged in
const isLoggedIn = (req, res, next) => {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    res.status(403).render('404', {
        title: 'Access Denied',
        error: 'You do not have permission to access this page'
    });
};

module.exports = { isLoggedIn, isAdmin };