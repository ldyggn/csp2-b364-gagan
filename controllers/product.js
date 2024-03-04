//[SECTION] Dependencies and Modules
const Product = require("../models/Product");
const User = require("../models/User");

// [SECTION] Create Product (Admin Only)
module.exports.addProduct = (req, res) => {
	  const newProduct = new Product({
	  	name: req.body.name,
	  	description: req.body.description,
	  	price: req.body.price
	  });

	Product.findOne({ name: req.body.name })
	.then(existingProduct => {
		if (existingProduct){
			return res.status(409).send({ error: 'Product already exists' })
		}

		return newProduct.save()
		.then(savedProduct => {
			
			return res.status(201).send({ savedProduct })
		})
		
		.catch(saveErr => {
			
			console.error("Error in saving the product: ", saveErr)

		
			return res.status(500).send({ error: 'Failed to save the product'})
		})
	})
	.catch(findErr => {
		
		console.error("Error in finding the product: ", findErr)


		return res.status(500).send({ message: 'Error finding the product'})
	})	
}; 