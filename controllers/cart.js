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

        // Check if the product is already in the cart
        const existingItemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);
        if (existingItemIndex !== -1) {
            // Update quantity and subtotal if the product is already in the cart
            cart.cartItems[existingItemIndex].quantity += quantity;
            cart.cartItems[existingItemIndex].subtotal += subtotal;
        } else {
            // Add the item to the cart if it's not already there
            cart.cartItems.push({ 
                productId, 
                name: product.name, // Add product name here
                quantity, 
                subtotal 
            });
        }

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

// [SECTION] Update Product Quantity in Cart
module.exports.updateProductQuantity = async (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    try {
        // Find the user's cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        // Find the cart item to update
        const cartItem = cart.cartItems.find(item => item.productId.toString() === productId);

        if (!cartItem) {
            return res.status(404).send({ error: 'Product not found in cart' });
        }

        // Find the product in the database
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).send({ error: 'Product not found' });
        }

        // Calculate differences in quantity and subtotal
        const oldQuantity = cartItem.quantity;
        const oldSubtotal = cartItem.subtotal;
        const newSubtotal = product.price * quantity;
        const quantityDiff = quantity - oldQuantity;

        // Update cart item details
        cartItem.quantity = quantity;
        cartItem.subtotal = newSubtotal;
        // Update total price of the cart
        cart.totalPrice += quantityDiff * product.price;

        // Save the updated cart
        await cart.save();

        return res.status(200).send({ message: 'Product quantity updated successfully', cart });
    } catch (err) {
        console.error('Error updating product quantity:', err);
        return res.status(500).send({ error: 'Failed to update product quantity' });
    }
};

// [SECTION] Remove Item from Cart
module.exports.removeItemFromCart = async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.productId;

    try {
        // Find the user's cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        // Find the index of the cart item to remove
        const cartItemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

        if (cartItemIndex === -1) {
            return res.status(404).send({ error: 'Product not found in cart' });
        }

        // Remove the cart item and update total price
        const { quantity, subtotal } = cart.cartItems[cartItemIndex];
        cart.cartItems.splice(cartItemIndex, 1);
        cart.totalPrice -= subtotal;

        // Save the updated cart
        await cart.save();

        return res.status(200).send({ message: 'Product removed from cart successfully', cart });
    } catch (err) {
        console.error('Error removing product from cart:', err);
        return res.status(500).send({ error: 'Failed to remove product from cart' });
    }
};

// [SECTION] Clear Cart Items
module.exports.clearCartItems = async (req, res) => {
    const userId = req.user.id;

    try {
        // Find the user's cart
        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).send({ error: 'Cart not found' });
        }

        // Clear cart items and update total price
        cart.cartItems = [];
        cart.totalPrice = 0;

        // Save the updated cart
        await cart.save();

        return res.status(200).send({ message: 'Cart items cleared successfully', cart });
    } catch (err) {
        console.error('Error clearing cart items:', err);
        return res.status(500).send({ error: 'Failed to clear cart items' });
    }
};
