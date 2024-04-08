const Cart = require("../models/Cart");
const Order = require("../models/Order");

module.exports.checkout = async (req, res) => {
    try {
        const userId = req.user._id; // Assuming user ID is stored in _id

        // Find the user's cart
        const cart = await Cart.findOne({ userId }).populate('cartItems.productId');

        // If no cart is found, send a message to the client
        if (!cart) {
            return res.status(404).json({ error: 'Cart not found' });
        }

        // Check if the cart contains any items
        if (cart.cartItems.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Map cart items to the format required by the order schema
        const productsOrdered = cart.cartItems.map(item => ({
            productId: item.productId._id, 
            productName: item.productId.name, 
            quantity: item.quantity,
            subtotal: item.subtotal
        }));

        // Create a new order document
        const newOrder = new Order({
            userId: userId,
            productsOrdered: productsOrdered,
            totalPrice: cart.totalPrice
        });

        // Save the order document
        const order = await newOrder.save();

        // Clear the user's cart after successful order creation
        await Cart.findOneAndUpdate({ userId }, { cartItems: [], totalPrice: 0 });

        // Send a message to the client along with the order details
        res.status(200).json({ message: 'Order created successfully', order });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Failed to create order' });
    }
};

// [SECTION] Retrieve Logged In User's Orders 
module.exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user._id }).populate('userId');

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'No orders found' });
        }

        res.status(200).json({ orders });
    } catch (error) {
        console.error("Error fetching user orders:", error);
        res.status(500).json({ error: 'Failed to fetch user orders' });
    }
};

// [SECTION] Retrieve All Orders
module.exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId');

        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'No orders found' });
        }

        res.status(200).json({ orders });
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ error: 'Failed to fetch all orders' });
    }
};