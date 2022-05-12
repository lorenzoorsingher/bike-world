const express = require('express');
const router = express.Router();
const User = require('./models/user'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// ---------------------------------------------------------
// route to authenticate and get a new token
// ---------------------------------------------------------
router.get('/authentication', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the user
	let user = await User.findOne({
		username: req.query.username
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
		username: user.username,
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
		username: user.username,
		id: user._id,
		self: "api/v1/" + user._id
	});

});

// ---------------------------------------------------------
// route to signUp
// ---------------------------------------------------------
router.post('/signUp', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	// find the user
	let userAlreadyExists = await User.findOne({
		username: req.body.username
	}).exec();
	
	// user already exists
	if (userAlreadyExists) {
		res.json({ success: false, message: 'Signup failed. User already exists.' });
		return;	//to stop the execution of the function	
	}

    //save user in the db
    const newUser = new User({username: req.body.username, email: req.body.email, psw: req.body.psw, permissions: false, target: req.body.target});
    await newUser.save();

    ////////Si può togliere??? Mi serve ottenere l'id
    // find the user to get the ID      
	let user = await User.findOne({
		username: newUser.username
	}).exec();
	
	// if user is found and password is right create a token
	var payload = {
		permissions: user.permissions,
		username: user.username,
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
		message: 'Signup completed!',
		token: token,
		permissions: user.permissions,
		username: user.username,
		id: user._id,
		self: "api/v1/" + user._id
	});

});


// ---------------------------------------------------------
// route to get account info
// ---------------------------------------------------------
router.get('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the user
	let user = await User.findOne({
		username: req.query.username
	}).exec();
	
	// user not found
	if (!user) {
		res.json({ success: false, message: 'User not found.' });	
		return;	//to stop the execution of the function	
	}
	
	// if user is found and password is right create a token
	var payload = {
		target: user.target,
		permissions: user.permissions,
		username: user.username,
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
		message: 'Info!',
		token: token,
		target: user.target,
		permissions: user.permissions,
		email: user.email,
		username: user.username,
		psw: user.psw,
		id: user._id,
		self: "api/v1/" + user._id
	});

});


// ---------------------------------------------------------
// route to update account info
// ---------------------------------------------------------
router.put('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
    //update user in the db
	await User.updateOne({'username': req.body.username}, {$set: {'email': req.body.email,'psw': req.body.psw, 'target': req.body.target}});

    ////////Si può togliere??? Mi serve ottenere l'id
    // find the user to get the ID      
	let user = await User.findOne({
		username: req.body.username
	}).exec();
	
	// if user is found and password is right create a token
	var payload = {
		permissions: user.permissions,
		username: user.username,
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
		message: 'Information updated!',
		token: token,
		permissions: user.permissions,
		username: user.username,
		id: user._id,
		self: "api/v1/" + user._id
	});

});


module.exports = router;