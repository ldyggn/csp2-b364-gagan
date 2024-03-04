const jwt = require("jsonwebtoken")
const secret = "EcommerceBookingAPI";

module.exports.createAccessToken = (user) => {
	const data = {
		id : user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}

	return jwt.sign(data, secret, {});
}


// [SECTION] Token Verification
module.exports.verify = (req, res, next) => {
	console.log(req.headers.authorization)

	let token = req.headers.authorization

	if(typeof token === "undefined"){
		return res.send({ auth: "Failed. No Token"})
	} else {
		console.log(token);
		token = token.slice(7, token.length)
		console.log(token);

		jwt.verify(token, secret, function(err, decodedToken){
			// If there is an error in verification, an erratic token, a wrong secret within the token, we will send a message to the client.
			if (err){
				return res.send({
					auth: "Failed",
					message: err.message
				})
			} else {
				console.log("result from verify method:")
				console.log(decodedToken)

				req.user = decodedToken;

				next();
			}
		})
	}
}

module.exports.verifyAdmin = (req, res, next) => {
    // Checks if the owner of the token is an admin.
    if(req.user.isAdmin){
        // If it is, move to the next middleware/controller using the next() method.
        next();
    } else {
        // Else, end the request-response cycle by sending the appropriate response and status code.
        return res.status(403).send({
        	auth: "Failed",
        	message: "Action Forbidden"
        })
    }
        console.log("result from verifyAdmin method");
        console.log(req.user);
}

// [SECTION] A middleware that checks if the user was successfullly authenticated via passport using the Google API
module.exports.isLoggedIn = (req, res, next) => {
	if (req.user) {
		next();
	} else {
		res.sendStatus(401);
	}
}