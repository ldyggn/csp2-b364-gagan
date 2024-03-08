// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");

// Allows our backend app to be available in the frontend
// Allows us to control 
const cors = require("cors");

// [SECTION] Environment Setup
const port = 4005;

// Allows access to routes defined within our application
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/order");
const nodemailerRoutes = require("./routes/nodemailer");

// [SECTION] Server Setup
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

// [SECTION] Database connection
mongoose.connect("mongodb+srv://ldgyggn:admin1234@cluster0.wopzhb2.mongodb.net/E-Commerce?retryWrites=true&w=majority")

mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'))

// Groups all routes
app.use("/b5/users", userRoutes);
app.use("/b5/products", productRoutes);
app.use("/b5/carts", cartRoutes);
app.use("/b5/orders", orderRoutes);
app.use("/b5/nodemailers", nodemailerRoutes);

// [SECTION] Server Gateway Response
if(require.main === module){
	app.listen(process.env.PORT || port, () => {
		console.log(`API is now online on port ${ process.env.PORT || port } `)
	});
}


module.exports = app;