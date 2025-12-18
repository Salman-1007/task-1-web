const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/ecommerce'); // Updated database name

User.updateOne({ email: 'msalmanadil44@gmail.com' }, { $set: { isAdmin: true } })
    .then(r => {
        console.log(r);
        process.exit();
    })
    .catch(e => {
        console.error(e);
        process.exit(1);
    });