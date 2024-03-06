// [SECTION] Dependencies and Modules
const express = require("express");
const cartController = require("../controllers/cart");
const auth = require("../auth");

// [SECTION] Routing Component
const router = express.Router();
const { verify } = auth;

// [SECTION] Route for retrieving user's cart
router.get("/get-cart", verify, cartController.getUserCart);

// [SECTION] Route for adding product to cart
router.post("/add-to-cart", verify, cartController.addToCart);

// [SECTION] Route for changing product quantity in cart
router.patch("/update-cart-quantity", verify, cartController.updateProductQuantity);

// [SECTION] Route for removing item from cart
router.patch("/:productId/remove-from-cart", verify, cartController.removeItemFromCart);

// [SECTION] Route for clearing cart
router.put("/clear-cart", verify, cartController.clearCart);

module.exports = router;