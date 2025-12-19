const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: {
        type: String,
        unique: true,
        required: true
    },
    // New: Links the order to a specific User
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null // Allows for guest checkout if your logic permits it
    },
    customerName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    items: [{
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }],
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'card', 'wallet'],
        default: 'cod'
    },
    status: {
        type: String,
        enum: ['Placed', 'Processing', 'Delivered'],
        default: 'Placed'
    },
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Automatically update the 'updatedAt' field on save
orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Order', orderSchema);