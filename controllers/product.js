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

// [SECTION] Retrieve All Products
module.exports.getAllProducts = (req, res) => {
	return Product.find({})
   .then(products => {
	   
	   if(products.length > 0) {
		  
		   return res.status(200).send({ products })
	   } else {
		   return res.status(200).send({ message: ' No products found. '})
	   }
   })
   .catch(err => {
	   console.error("Error in finding all products: ", err)
	   return res.status(500).send({ error: 'Error finding products.' })
   });
};


// [SECTION] Retrieve All Active Products
module.exports.getAllActive = (req, res) => {

	Product.find({ isActive: true }).then(products => {
		// if the result is not null
		if (products.length > 0){
			// send the result as a response
			return res.status(200).send({ products });
		}
		// if there are no results found
		else {
			return res.status(200).send({ message: 'No active products found.' })
		}
	}).catch(err => {
		console.error("Error in finding active products: ", err)
		return res.status(500).send({ error: 'Error finding active products.' })
	})
};

// [SECTION] Retrieve Single Product
module.exports.getProduct = (req, res) => {
	const productId = req.params.productId;

	Product.findById(productId)
	.then(product => {
		if (!product) {
			return res.status(404).send({ error: 'Product not found' });
		}
		return res.status(200).send({ product });
	})
	.catch(err => {
		console.error("Error in fetching the product: ", err)
		return res.status(500).send({ error: 'Failed to fetch product' });
	})
};

// [SECTION] Update Product Info
module.exports.updateProduct  = (req, res) => {

	let updatedProduct = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }

    return Product.findByIdAndUpdate(req.params.productId, updatedProduct)
    .then(updatedProduct => {
        if (!updatedProduct) {

            return res.status(404).send({ error: 'Product not found' });

        }

        return res.status(200).send({ 
        	message: 'Product updated successfully', 
        	updatedProduct: updatedProduct 
        });

    })
    .catch(err => {
		console.error("Error in updating a product: ", err)
		return res.status(500).send({ error: 'Error in updating a product.' });
	});
};

// [SECTION] Archive Product
module.exports.archiveProduct = (req, res) => {

    let updateActiveField = {
        isActive: false
    }
    
    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(archiveProduct => {
        if (!archiveProduct) {
        	return res.status(404).send({ error: 'Product not found' });
        }
        return res.status(200).send({ 
        	message: 'Product archived successfully', 
        	archiveProduct: archiveProduct 
        });
    })
    .catch(err => {
    	console.error("Error in archiving a product: ", err)
    	return res.status(500).send({ error: 'Failed to archive product' })
    });

};

// [SECTION] Activate Product
module.exports.activateProduct = (req, res) => {

    let updateActiveField = {
        isActive: true
    }
    
    return Product.findByIdAndUpdate(req.params.productId, updateActiveField)
    .then(activateProduct => {
        if (!activateProduct) {
        	return res.status(404).send({ error: 'Product not found' });
        }
        return res.status(200).send({ 
        	message: 'Product activated successfully', 
        	activateProduct: activateProduct
        });
    })
    .catch(err => {
    	console.error("Error in activating a product: ", err)
    	return res.status(500).send({ error: 'Failed to activating a product' })
    });
};