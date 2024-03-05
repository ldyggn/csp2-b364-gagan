//[SECTION] Dependencies and Modules
const Cart = require("../models/Cart");
const Product = require("../models/Product");

// [SECTION] Retrieve User's Cart
module.exports.getUserCart = (req, res) => {
    const userId = req.user.id; // 

    // Find the cart associated with the user ID
    Cart.findOne({ userId })
        .then(cart => {
            if (!cart) {
                return res.status(404).send({ error: 'Cart not found' });
            }
            return res.status(200).send({ cart });
        })
        .catch(err => {
            console.error("Error in fetching user's cart:", err);
            return res.status(500).send({ error: 'Failed to fetch user\'s cart' });
        });
};

// [SECTION] Add to Cart
module.exports.addToCart = (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Find the product to be added to the cart
    Product.findById(productId)
        .then(product => {
            if (!product) {
                return res.status(404).send({ error: 'Product not found' });
            }

            // Calculate subtotal for the item
            const subtotal = product.price * quantity;

            // Find the user's cart or create a new one if not exist
            return Cart.findOne({ userId })
                .then(cart => {
                    if (!cart) {
                        // If cart doesn't exist, create a new one
                        cart = new Cart({ userId, cartItems: [] });
                    }

                    // Find the item in the cart
                    const cartItem = cart.cartItems.find(item => item.productId === productId);

                    if (cartItem) {
                        // If product exists in the cart, update the quantity and subtotal
                        cartItem.quantity += quantity;
                        cartItem.subtotal += subtotal;
                    } else {
                        // If product doesn't exist in the cart, add it
                        cart.cartItems.push({ productId, quantity, subtotal });
                    }

                    // Update the total price of the cart
                    cart.totalPrice += subtotal;

                    // Save the updated cart to the database
                    return cart.save();
                });
        })
        .then(updatedCart => {
            return res.status(200).send({ message: 'Product added to cart successfully', cart: updatedCart });
        })
        .catch(err => {
            console.error('Error adding product to cart:', err);
            return res.status(500).send({ error: 'Failed to add product to cart' });
        });
};

// [SECTION] Update Product Quantity
module.exports.updateProductQuantity = (req, res) => {
    const userId = req.user.id;
    const { productId, quantity } = req.body;

    // Find the user's cart
    Cart.findOne({ userId })
        .then(cart => {
            // If no cart is found, send a message to the client
            if (!cart) {
                return res.status(404).send({ error: 'Cart not found' });
            }

            // Check if the cart contains the product
            const cartItem = cart.cartItems.find(item => item.productId === productId);

            if (cartItem) {
                // If the product exists in the cart, update the quantity and subtotal
                cartItem.quantity = quantity;

                // Fetch the product to get the price
                Product.findById(productId)
                    .then(product => {
                        if (!product) {
                            return res.status(404).send({ error: 'Product not found' });
                        }
                        cartItem.subtotal = quantity * product.price;

                        // Recalculate the total price of the cart
                        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

                        // Save the updated cart
                        return cart.save();
                    })
                    .then(updatedCart => {
                        return res.status(200).send({ message: 'Product quantity updated successfully', cart: updatedCart });
                    })
                    .catch(err => {
                        console.error('Error fetching product or updating cart:', err);
                        return res.status(500).send({ error: 'Failed to update product quantity in cart' });
                    });
            } else {
                // If the product doesn't exist in the cart, add it
                Product.findById(productId)
                    .then(product => {
                        if (!product) {
                            return res.status(404).send({ error: 'Product not found' });
                        }
                        const subtotal = product.price * quantity;
                        cart.cartItems.push({ productId, quantity, subtotal });
                        cart.totalPrice += subtotal;

                        // Save the updated cart
                        return cart.save();
                    })
                    .then(updatedCart => {
                        return res.status(200).send({ message: 'Product added to cart successfully', cart: updatedCart });
                    })
                    .catch(err => {
                        console.error('Error finding product or updating cart:', err);
                        return res.status(500).send({ error: 'Failed to update product quantity in cart' });
                    });
            }
        })
        .catch(err => {
            console.error('Error finding cart:', err);
            return res.status(500).send({ error: 'Failed to update product quantity in cart' });
        });
};