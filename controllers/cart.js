//[SECTION] Dependencies and Modules
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// [SECTION] Retrieve User's Cart
module.exports.getUserCart = async (req, res) => {
    const userId = req.user.id;

    try {
        // Find the cart associated with the user ID
        const cart = await Cart.findOne({ userId }).populate('cartItems.productId');

        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        // Map cart items to include product details

        return res.status(200).send({ cart });
    } catch (err) {
        console.error("Error in fetching user's cart:", err);
        return res.status(500).send({ error: 'Failed to fetch user\'s cart' });
    }
};

// [SECTION] Add to Cart
module.exports.addToCart = async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    try {
        // Find the product to be added to the cart
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        // Calculate subtotal for the item
        const subtotal = product.price * quantity;

        // Find the user's cart or create a new one if not exist
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, cartItems: [] });
        }

        // Add the item to the cart with product name included
        cart.cartItems.push({ 
            productId, 
            name: product.name, // Add product name here
            quantity, 
            subtotal 
        });

        // Update the total price of the cart
        cart.totalPrice += subtotal;

        // Save the updated cart to the database
        const updatedCart = await cart.save();

        return res.status(200).send({ message: 'Product added to cart successfully', cart: updatedCart });
    } catch (err) {
        console.error('Error adding product to cart:', err);
        return res.status(500).send({ error: 'Failed to add product to cart' });
    }
};

    // [SECTION] Update Product Quantity
    module.exports.updateProductQuantity = async (req, res) => {
    try {
        // Extract userId, productId, and quantity from the request body
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        // Find the cart associated with the userId
        let cart = await Cart.findOne({ userId });

        // If no cart is found, return an error response
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        // Find the item in the cart corresponding to the productId
        let cartItem = cart.cartItems.find(item => item.productId.equals(productId));

        // If the item exists in the cart
        if (cartItem) {
            // Fetch the price of the product
            const productPrice = await getProductPrice(productId);

            // If the product price is not found, return an error response
            if (productPrice === null) {
                return res.status(404).send({ error: 'Product not found' });
            }

            // Calculate the change in quantity
            const quantityChange = quantity - cartItem.quantity;

            // Update the quantity of the item in the cart
            cartItem.quantity = quantity;

            // Update the subtotal based on the change in quantity
            cartItem.subtotal += quantityChange * productPrice;
        } else {
            // If the item doesn't exist in the cart, add it
            const productPrice = await getProductPrice(productId);

            // If the product price is not found, return an error response
            if (productPrice === null) {
                return res.status(404).send({ error: 'Product not found' });
            }

            // Add the new item to the cart with the specified quantity and subtotal
            cart.cartItems.push({ productId, quantity, subtotal: quantity * productPrice });
        }

        // Recalculate the total price of the cart
        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        // Save the updated cart
        const updatedCart = await cart.save();

        // Return a success response with the updated cart
        return res.status(200).send({ message: 'Product quantity updated successfully', cart: updatedCart });
    } catch (error) {
        // If an error occurs, log the error and return an error response
        console.error('Error updating product quantity:', error);
        return res.status(500).send({ error: 'Failed to update product quantity in cart' });
    }
};

    // [SECTION] Remove Item from Cart
module.exports.removeItemFromCart = async (req, res) => {
    try {
        // Extract userId and productId from the request
        const userId = req.user.id;
        const productId = req.params.productId;

        // Find the cart associated with the userId
        let cart = await Cart.findOne({ userId });

        // If no cart is found, return an error response
        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        // Find the item in the cart corresponding to the productId
        const updatedCartItems = cart.cartItems.filter(item => !item.productId.equals(productId));

        // If the item exists in the cart
        if (updatedCartItems.length < cart.cartItems.length) {
            // Recalculate the total price of the cart
            const totalPrice = updatedCartItems.reduce((total, item) => total + item.subtotal, 0);

            // Update cart with new cart items and total price
            cart.cartItems = updatedCartItems;
            cart.totalPrice = totalPrice;

            // Save the updated cart
            const updatedCart = await cart.save();

            // Return a success response with the updated cart
            return res.status(200).send({ message: 'Item removed from cart successfully', cart: updatedCart });
        } else {
            // If the item doesn't exist in the cart, return an error response
            return res.status(404).send({ error: 'Item not found in cart' });
        }
    } catch (error) {
        // If an error occurs, log the error and return an error response
        console.error('Error removing item from cart:', error);
        return res.status(500).send({ error: 'Failed to remove item from cart' });
    }
};

// [SECTION] Clear Cart Items
module.exports.clearCart = async (req, res) => {
    try {
        // Extract userId from the request
        const userId = req.user.id;

        // Find the cart associated with the userId and update it to clear cart items and set total price to 0
        const updatedCart = await Cart.findOneAndUpdate({ userId }, { cartItems: [], totalPrice: 0 }, { new: true });

        // If no updated cart is found, return an error response
        if (!updatedCart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        // Return a success response with the updated cart
        return res.status(200).send({ message: 'Cart cleared successfully', cart: updatedCart });
    } catch (error) {
        // If an error occurs, log the error and return an error response
        console.error('Error clearing cart:', error);
        return res.status(500).send({ error: 'Failed to clear cart' });
    }
};
