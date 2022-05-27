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

module.exports = router;