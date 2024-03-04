// [SECTION] Dependencies and Modules

const User = require("../models/User");
const bcrypt = require('bcrypt');
const auth = require("../auth");

// [SECTION] User registration

module.exports.registerUser = (req,res) => {
	// checks if the email is in the right format
	if (!req.body.email.includes("@")){
		return res.status(400).send({ error: "Email invalid" });
	}
	// checks if the mobile number has the correct number of characters
	else if (req.body.mobileNo.length !== 11){
		return res.status(400).send({ error: "Mobile number invalid" });
	}
	// checks if the password has atleast 8 characters
	else if (req.body.password.length < 8) {
		return res.status(400).send({ error: "Password must be atleast 8 characters" });
	}
	// if all needed formats are achieved
	else {
		
		let newUser = new User({
			firstName : req.body.firstName,
			lastName : req.body.lastName,
			email : req.body.email,
			mobileNo : req.body.mobileNo,
			password : bcrypt.hashSync(req.body.password, 10)
		})
		// Saves the created object to our database
		newUser.save()
		.then((user) => res.status(201).send({ message: "Registered Successfully" }))
		.catch(err => {
			console.error("Error in saving: ", err)
			return res.status(500).send({ error: "Error in save"})
		})
	}
};

// [SECTION] User authentication

module.exports.loginUser = (req, res) => {
	
	if(req.body.email.includes("@")){
		User.findOne({ email : req.body.email })
		.then(result => {
			// if the email is not found in the database
			if(result == null){
				// send the message to the user
				return res.status(404).send({ error: "No Email Found" });
			} else {

				const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

				// If the passwords match/result of the above code is true
				if (isPasswordCorrect) {

					// Generate an access token				
					return res.status(200).send({ access : auth.createAccessToken(result)})

				// Passwords do not match
				} else {
					return res.status(401).send({ message: "Email and password do not match" });
				}
			}
		})
		.catch(err => {
			console.error("Error in find: ", err)
			return res.status(500).send({ error: "Error in find"})
		})
		}
		else {
			return res.status(400).send({error: "Invalid Email"})
		}
};

//[SECTION] Retrieve user details
module.exports.getProfile = (req, res) => {
    const userId = req.user.id;

    User.findById(userId)
    .then(user => {
        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        // Exclude sensitive information like password
        user.password = undefined;

        return res.status(200).send({ user });
    })
    .catch(err => {
    	console.error("Error in fetching user profile", err)
    	return res.status(500).send({ error: 'Failed to fetch user profile' })
    });
};

//[SECTION] Function to update user details by admin
module.exports.updateUserByAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        const updatedData = req.body;

        // Check if the current user is an admin
        if (!req.user.isAdmin) {
            return res.status(403).send({ error: 'You are not authorized to perform this action' });
        }

        // Update the user details
        const updatedUser = await User.findByIdAndUpdate(userId, updatedData, { new: true });

        if (!updatedUser) {
            return res.status(404).send({ error: 'User not found' });
        }

        return res.status(200).send({ message: 'User details updated successfully', user: updatedUser });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

// [SECTION] Function to reset the password
module.exports.updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    const { id } = req.user; // Extracting user ID from the authorization header

    // Hashing the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Updating the user's password in the database
    await User.findByIdAndUpdate(id, { password: hashedPassword });

    // Sending a success response
    res.status(200).send({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Internal server error' });
  }
};