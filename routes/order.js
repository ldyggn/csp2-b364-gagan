// [SECTION] Dependencies and Modules
const express = require("express");
const orderController = require("../controllers/order");
const auth = require("../auth");

const router = express.Router();
const { verify, verifyAdmin} = auth;

// Route for checking out and creating an order
router.post("/checkout", verify, orderController.checkout);

// Route for retrieving logged in user's orders
router.get("/my-orders", verify, orderController.getOrders);

// Route for retrieving all orders
router.get("/all-orders", verify, verifyAdmin, orderController.getAllOrders);

module.exports = router;
