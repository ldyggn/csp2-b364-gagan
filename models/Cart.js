const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: [true, 'User ID is Required']
    },
    cartItems: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                required: [true, 'Quantity is Required']
            },
            subtotal: {
                type: Number,
                required: [true, 'Subtotal is Required']
            }
        }
    ],
    totalPrice: {
        type: Number,
        default: 0
    },
    orderedOn: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cart', cartSchema);