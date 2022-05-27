const express = require('express');
const router = express.Router();
const Itinerary = require('../../models/itinerary');
const verifyToken = require('../../middleware/auth');

// ---------------------------------------------------------
// route to add new itineraries
// ---------------------------------------------------------
router.post('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	if(!req.body.name || !req.body.addressStarting || isNaN(parseFloat(req.body.latS)) || isNaN(parseFloat(req.body.lngS)) || !req.body.description || !req.body.difficulty || isNaN(parseFloat(req.body.length))){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

    // find the itinerary
	let itineraryAlreadyExists = await Itinerary.findOne({
		name: req.body.name
	});
	
	// itinerary already exists
	if (itineraryAlreadyExists) {
		res.status(409).json({ success: false, message: 'Creation itinerary failed. Itinerary already exists.' });
		return;
	}

    //save user in the db
    const newItinerary = await Itinerary.create({
		name: req.body.name, 
		addressStarting: req.body.addressStarting, 
		latS: parseFloat(req.body.latS), 
		lngS: parseFloat(req.body.lngS),
        description: req.body.description, 
		difficulty: req.body.difficulty,
		length: parseFloat(req.body.length)
	});

	res.status(201).json({
		success: true,
		message: 'New itinerary added!',
		itinerary: {
			_id: newItinerary._id,
			name: newItinerary.name,
		  	addressStarting: newItinerary.addressStarting,
		  	latS: newItinerary.latS, 
		  	lngS: newItinerary.lngS, 
            description: newItinerary.description,
		  	length: newItinerary.length,
		  	difficulty: newItinerary.difficulty,
			self: "/api/v2/itinerary/" + newItinerary._id
		}
	});
});


// ---------------------------------------------------------
// route to get itineraries
// ---------------------------------------------------------
router.get('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the itineraries
	let itineraries = await Itinerary.find({});	
	res.json(itineraries.map(itinerary => {
		return {
			_id: itinerary._id,
			name: itinerary.name,
		  	addressStarting: itinerary.addressStarting,
		  	latS: itinerary.latS, 
		  	lngS: itinerary.lngS, 
            description: itinerary.description,
		  	length: itinerary.length,
		  	difficulty: itinerary.difficulty,
			self: "/api/v2/itinerary/" + itinerary._id
		}
	}));
});

// ---------------------------------------------------------
// route to get itinerary name
// ---------------------------------------------------------
router.get('/name', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the itinerary
	let itineraries = await Itinerary.find({}, { name : 1});
	res.status(200).json(itineraries);
});

// ---------------------------------------------------------
// route to delete itinerary
// ---------------------------------------------------------
router.delete('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	if(!req.params.id){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

	let itinerary = await Itinerary.findById(req.params.id);
	if(itinerary == null){
        return res.status(404).json({
            success: false,
            message: 'Itinerary not found'
        });
	}

	// remove the itinerary
	await Itinerary.deleteOne({_id: req.params.id});

	res.status(200).json({
		success: true,
		message: 'Itinerary deleted!'
	});    
});

// ---------------------------------------------------------
// route to update itinerary info
// ---------------------------------------------------------
router.put('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
    if(!req.params.id || !req.body.addressStarting || isNaN(parseFloat(req.body.latS)) || isNaN(parseFloat(req.body.lngS)) || !req.body.description || !req.body.difficulty || isNaN(parseFloat(req.body.length))){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

    //update rental point in the db
	let result = await Itinerary.updateOne({'_id': req.params.id}, 
								{$set: {
									'addressStarting': req.body.address,
									'description': req.body.description,
                                    'latS': req.body.latS, 
									'lngS': req.body.lngS, 
									'difficulty': req.body.difficulty,
                                    'length': req.body.length
								}});

	if(result.modifiedCount == 0){
		res.status(404).json({
			success: false,
			message: 'Itinerary not found'
		});
	}else{
		res.status(200).json({
			success: true,
			message: 'Itinerary info updated!'
		});   
	}
});

// ---------------------------------------------------------
// route to get itinerary based on the difficulty
// ---------------------------------------------------------
router.get('/difficulty', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	if(!req.query.difficulty){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}
	
	let difficulty = req.query.difficulty;
	
	// find the itineraries
	let itineraries = await Itinerary.find({ 'difficulty': difficulty });	
	res.status(200).json(itineraries.map(itinerary => {
		return {
			_id: itinerary._id,
			name: itinerary.name,
		  	addressStarting: itinerary.addressStarting,
            description: itinerary.description,
		  	latS: itinerary.latS, 
		  	lngS: itinerary.lngS, 
		  	difficulty: itinerary.difficulty,
		  	length: itinerary.length,
			self: "/api/v2/itineraries/" + itinerary._id
		}
	}));
});

// ---------------------------------------------------------
// route to get itineraries based on the zone
// ---------------------------------------------------------
router.get('/zone', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	if(isNaN(parseFloat(req.query.latitude)) || isNaN(parseFloat(req.query.longitude))){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

	let lat = parseFloat(req.query.latitude);
	let lng = parseFloat(req.query.longitude);
	let latV = 0.27;
	let lngV = 0.38;

	// find the itineraries
	let itineraries = await Itinerary.find({ 
		'latS': {$gte: lat - latV, $lte: lat+latV }, 
		'lngS':{$gte: lng - lngV, $lte: lng+lngV }
	});
	
	res.status(200).json(itineraries.map(itinerary => {
		return {
			_id: itinerary._id,
			name: itinerary.name,
		  	addressStarting: itinerary.addressStarting,
            description: itinerary.description,
		  	latS: itinerary.latS, 
		  	lngS: itinerary.lngS, 
		  	difficulty: itinerary.difficulty,
		  	length: itinerary.length,
			self: "/api/v2/itineraries/" + itinerary._id
		}
	}));
});

// ---------------------------------------------------------
// route to get itineraries based on the length
// ---------------------------------------------------------
router.get('/length', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	if(isNaN(parseFloat(req.query.minLength)) || isNaN(parseFloat(req.query.maxLength))){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

	// find the itineraries
	let itineraries = await Itinerary.find({ 
		'length': {$gte: req.query.minLength, $lte: req.query.maxLength }
	});
	
	res.status(200).json(itineraries.map(itinerary => {
		return {
			_id: itinerary._id,
			name: itinerary.name,
		  	addressStarting: itinerary.addressStarting,
            description: itinerary.description,
		  	latS: itinerary.latS, 
		  	lngS: itinerary.lngS, 
		  	difficulty: itinerary.difficulty,
		  	length: itinerary.length,
			self: "/api/v2/itineraries/" + itinerary._id
		}
	}));
});

module.exports = router;