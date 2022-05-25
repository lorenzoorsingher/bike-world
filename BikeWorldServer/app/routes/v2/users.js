const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const verifyToken = require('../../middleware/auth');
const tokenGenerator = require('../../utils/tokenGenerator');

router.post('/login', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	const { username, password } = req.body;

	if(!username || !password){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}
	
	// find the user
	let user = await User.findOne({
		username: username
	});
	
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
			self: "/api/v2/users/" + user._id,
		});
		return;
	}

	res.status(400).json({ success: false, message: 'Authentication failed. Wrong username or password.' });
});

router.post('/signUp', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	if(!req.body.username || !req.body.password || !req.body.email || !req.body.target){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

	// find the user
	let userAlreadyExists = await User.findOne({
		username: req.body.username
	});
	
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
		self: "/api/v2/users/" + newUser._id
	});
});

router.get('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	if(!req.params.id){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

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
		self: "/api/v2/users/" + user._id,
		id: user._id,
		target: user.target,
		permissions: user.permissions,
		email: user.email,
		username: user.username
	});
});

router.put('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	if(!req.params.id || !req.body.password || !req.body.email || !req.body.target){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

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
		self: "api/v2/users/" + user._id
	});

});

module.exports = router;