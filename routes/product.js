//[SECTION] Dependencies and Modules
const express = require("express");
const productController = require("../controllers/product");
const auth = require("../auth");

//[SECTION] Routing Component
const router = express.Router();

const {verify, verifyAdmin} = auth;

//[SECTION] Route for creating a product
router.post("/", verify, verifyAdmin, productController.addProduct); 

module.exports = router;