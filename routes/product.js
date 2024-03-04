// [SECTION] Dependencies and Modules
const express = require("express");
const productController = require("../controllers/product");
const auth = require("../auth");

// [SECTION] Routing Component
const router = express.Router();

const {verify, verifyAdmin} = auth;

// [SECTION] Route for creating a product
router.post("/", verify, verifyAdmin, productController.addProduct); 

// [SECTION] Route for retrieving all products
router.get("/all", verify, verifyAdmin, productController.getAllProducts);

// [SECTION] Route for retrieving all active products
router.get("/", productController.getAllActive);

// [SECTION] Route for retrieving single product
router.get("/:productId", productController.getProduct);

// [SECTION] Route for updating product info
router.patch("/:productId/update", verify, verifyAdmin, productController.updateProduct);

// [SECTION] Route for archiving a product
router.patch("/:productId/archive", verify, verifyAdmin, productController.archiveProduct);

// [SECTION] Route for activating a product
router.patch("/:productId/activate", verify, verifyAdmin, productController.activateProduct);

module.exports = router;