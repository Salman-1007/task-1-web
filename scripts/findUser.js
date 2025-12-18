const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const findUser = async() => {
    try {
        await connectDB();
        const user = await User.findOne({ email: 'msalmanadil44@gmail.com' });
        if (user) {
            console.log('User found:', user);
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error finding user:', error);
    } finally {
        mongoose.connection.close();
    }
};

findUser();