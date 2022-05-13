const express = require('express');
const router = express.Router();
const User = require('../models/user'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/auth');
const tokenGenerator = require('../utils/tokenGenerator');

/**
 * @openapi
 * /api/v1/users/login:
 *   post:
 *     description: route to authenticate and get a new token
 *     responses:
 *       200:
 *         description: Returns a token.
 *       400:
 *         description: 
 */
router.post('/login', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	const { username, password } = req.body;
	
	// find the user
	let user = await User.findOne({
		username: username
	}).exec();
	
	// user not found
	if (!user) {
		res.status(400).json({ success: false, message: 'Authentication failed. User not found.' });	
		return;
	}
	
	if(await bcrypt.compare(password, user.psw_hash)) {
		// if user is found and password is right create a token
		let token = tokenGenerator(user);
		
		res.status(200).json({
			success: true,
			message: 'Token sucessfully created',
			token: token,
			permissions: user.permissions,
			username: user.username,
			id: user._id,
			self: "/api/v1/users/" + user._id,
		});
		return;
	}

	res.status(400).json({ success: false, message: 'Authentication failed. Wrong username or password.' });
});

/**
 * @openapi
 * /api/v1/users/signUp:
 *   post:
 *     description: route to signup
 *     responses:
 *       200:
 *         description: Returns a token.
 */
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
		res.status(409).json({ success: false, message: 'Signup failed. User already exists.' });
		return;
	}
	
	let pswHash = await bcrypt.hash(req.body.password, 10);
    
    const newUser = await User.create({
		username: req.body.username, 
		email: req.body.email, 
		psw_hash: pswHash,
		permissions: false, 
		target: req.body.target
	});
	
	let token = tokenGenerator(newUser);
	
	res.status(201).json({
		success: true,
		message: 'Signup completed!',
		token: token,
		permissions: newUser.permissions,
		username: newUser.username,
		id: newUser._id,
		self: "/api/v1/users/" + newUser._id
	});
});


/**
 * @openapi
 * /api/v1/users/{id}:
 *   get:
 *     description: Get Account info
 *     responses:
 *       200:
 *         description:
 */
router.get('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	const loggedUserId = req.loggedUser.user_id;
	
	// check if a user is trying to retrive another user informations
	if(loggedUserId != req.params.id){
		res.status(403).json({
			success: false,
			message: "Unauthorized. You can access only your informations."
		});
	}

	let user = await User.findById(req.params.id);
	
	res.status(200).json({
		self: "/api/v1/users/" + user._id,
		id: user._id,
		target: user.target,
		permissions: user.permissions,
		email: user.email,
		username: user.username
	});
});


/**
 * @openapi
 * /api/v1/users/{id}:
 *   put:
 *     description: Update User info
 *     responses:
 *       200:
 *         description: 
 */
router.put('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	let pswHash = await bcrypt.hash(req.body.password, 10);

	const loggedUserId = req.loggedUser.user_id;
	
	// check if a user is trying to retrive another user informations
	if(loggedUserId != req.params.id){
		res.status(403).json({
			success: false,
			message: "Unauthorized. You can access only your informations."
		});
	}

	await User.updateOne(
		{ '_id': req.params.id }, 
		{ $set: {
			'email': req.body.email,
			'psw_hash': pswHash, 
			'target': req.body.target
		}
	});

	let user = await User.findById(req.params.id);

	// regenerate the token because user changed
	let token = tokenGenerator(user);

	res.json({
		success: true,
		message: 'Information updated!',
		token: token,
		permissions: user.permissions,
		username: user.username,
		id: user._id,
		self: "api/v1/users/" + user._id
	});

});

module.exports = router;