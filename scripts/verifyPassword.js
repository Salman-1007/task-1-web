const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const verifyPassword = async() => {
    try {
        await connectDB();

        const email = 'msalmanadil44@gmail.com';
        const enteredPassword = 'newSecurePassword123'; // Replace with the password you want to test

        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            console.log('User not found');
            return;
        }

        const isPasswordCorrect = await user.comparePassword(enteredPassword);

        if (isPasswordCorrect) {
            console.log('Password is correct');
        } else {
            console.log('Password is incorrect');
        }
    } catch (error) {
        console.error('Error verifying password:', error);
    } finally {
        mongoose.connection.close();
    }
};

verifyPassword();