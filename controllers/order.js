const Cart = require("../models/Cart");
const Order = require("../models/Order");

// [SECTION] Checkout
module.exports.checkout = async (req, res) => {
    try {
        const userId = req.user.id;

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
            productId: item.productId._id, // Assuming _id is the ObjectId of the product
            productName: item.productId.name, // Assuming 'name' is a field in your Product model
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
}
// [SECTION] Retrieve Logged In User's Orders 
module.exports.getOrders = (req, res) => {
    Order.find({ userId: req.user.id })
        .populate('productsOrdered.productId') 
        .then(orders => {
            if (!orders || orders.length === 0) {
                return res.status(404).send({ error: 'No orders found' });
            }
            return res.status(200).send({ orders });
        })
        .catch(err => {
            console.error("Error in fetching orders:", err);
            return res.status(500).send({ error: 'Failed to fetch orders' });
        });
};

// [SECTION] Retrieve All Orders
module.exports.getAllOrders = (req, res) => {
    // Fetch all orders from the database
    Order.find()
        .populate('productsOrdered.productId') 
        .then(orders => {
            if (!orders || orders.length === 0) {
                return res.status(404).send({ error: 'No orders found' });
            }
            return res.status(200).send({ orders });
        })
        .catch(err => {
            console.error('Error retrieving all orders:', err);
            return res.status(500).send({ error: 'Failed to retrieve all orders' });
        });
};
