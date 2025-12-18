const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const connectDB = require('../config/database');

const resetPassword = async() => {
    try {
        await connectDB();

        const email = 'msalmanadil44@gmail.com';
        const newPassword = 'newSecurePassword123'; // Replace with your desired password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const result = await User.updateOne({ email }, { $set: { password: hashedPassword } });

        if (result.modifiedCount > 0) {
            console.log(`Password reset successfully for ${email}`);
        } else {
            console.log(`No user found with email ${email}`);
        }
    } catch (error) {
        console.error('Error resetting password:', error);
    } finally {
        mongoose.connection.close();
    }
};

resetPassword();