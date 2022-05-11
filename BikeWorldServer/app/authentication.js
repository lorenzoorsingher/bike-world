const express = require('express');
const router = express.Router();
const User = require('./models/user'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens


// ---------------------------------------------------------
// route to authenticate and get a new token
// ---------------------------------------------------------
router.get('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the user
	let user = await User.findOne({
		email: req.query.email
	}).exec();
	
	// user not found
	if (!user) {
		res.json({ success: false, message: 'Authentication failed. User not found.' });	
		return;	//to stop the execution of the function	
	}
	
	// check if password matches
	if (user.psw != req.query.psw) {
		res.json({ success: false, message: 'Authentication failed. Wrong password.' });
		return;	//to stop the execution of the function	
	}
	
	// if user is found and password is right create a token
	var payload = {
		permissions: user.permissions,
		email: user.email,
		id: user._id
		// other data encrypted in the token	
	}
	var options = {
		expiresIn: 86400 // expires in 24 hours
	}
	SUPER_SECRET='is2lab2020';
	var token = jwt.sign(payload, SUPER_SECRET, options);
	//var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
	
	res.json({
		success: true,
		message: 'Enjoy your token!',
		token: token,
		permissions: user.permissions,
		email: user.email,
		id: user._id,
		self: "api/v1/" + user._id
	});

});



module.exports = router;