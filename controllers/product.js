//[SECTION] Dependencies and Modules
const Product = require("../models/Product");

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
			return res.status(500).send({ error: 'Failed to activate a product' })
		});
	};

	// [SECTION] Search Products by Name
module.exports.searchProductsByName = (req, res) => {
    const { name } = req.body;

    Product.find({ name: { $regex: name, $options: 'i' } })
        .then(foundProducts => {
            if (foundProducts.length > 0) {
                res.status(200).send({ success: true, message: 'Products found by name', products: foundProducts });
            } else {
                res.status(404).send({ success: false, error: 'No products found by name' });
            }
        })
        .catch(err => {
            console.error('Error searching products by name:', err);
            res.status(500).send({ success: false, error: 'Failed to search products by name' });
        });
};

// [SECTION] Search Products by Price Range
module.exports.searchProductsByPriceRange = (req, res) => {
    const { minPrice, maxPrice } = req.body;
    
    const query = {
        price: {
            $gte: minPrice, // Greater than or equal to minPrice
            $lte: maxPrice  // Less than or equal to maxPrice
        }
    };

    // Find products in the database matching the price range query
    Product.find(query)
        .then(foundProducts => {
            if (foundProducts.length > 0) {
                res.status(200).send({ success: true, message: 'Products found by price range', products: foundProducts });
            } else {
                res.status(404).send({ success: false, error: 'No products found by price range' });
            }
        })
        .catch(err => {
            console.error('Error searching products by price range:', err);
            res.status(500).send({ success: false, error: 'Internal server error' });
        });
};