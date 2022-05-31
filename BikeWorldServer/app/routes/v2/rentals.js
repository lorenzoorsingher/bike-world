const express = require('express');
const router = express.Router();
const Bike = require('../../models/bike');
const RentalPoint = require('../../models/rentalPoint');
const Booking = require('../../models/booking.js');
const verifyToken = require('../../middleware/auth');

// ---------------------------------------------------------
// route to add new rental point
// ---------------------------------------------------------
router.post('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	if(!req.body.name || !req.body.address || isNaN(parseFloat(req.body.lat)) || isNaN(parseFloat(req.body.lng)) || !req.body.type){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

	if(req.body.lat < -90 || req.body.lat > 90 || req.body.lng < -180 || req.body.lng > 180){
        res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    // find the rental Point
	let rentalPointAlreadyExists = await RentalPoint.findOne({
		name: req.body.name
	});
	
	// rental point already exists
	if (rentalPointAlreadyExists) {
		res.status(409).json({ success: false, message: 'Creation rental point failed. Rental point already exists.' });
		return;
	}

    //save user in the db
    const newRentalPoint = await RentalPoint.create({
		name: req.body.name, 
		address: req.body.address, 
		lat: parseFloat(req.body.lat), 
		lng: parseFloat(req.body.lng), 
		type: req.body.type,
		bikeNumber: 0
	});

	res.status(201).json({
		success: true,
		message: 'New Rental Point added!',
		rental: {
			_id: newRentalPoint._id,
			name: newRentalPoint.name,
		  	address: newRentalPoint.address,
		  	lat: newRentalPoint.lat, 
		  	lng: newRentalPoint.lng, 
		  	type: newRentalPoint.type,
		  	bikeNumber: newRentalPoint.bikeNumber,
			self: "/api/v2/rentals/" + newRentalPoint._id
		}
	});
});


// ---------------------------------------------------------
// route to get rental point
// ---------------------------------------------------------
router.get('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the rental points
	let rentalPoints = await RentalPoint.find({ 'bikeNumber': {$gt : 0 }});	
	res.json(rentalPoints.map(rental => {
		return {
			_id: rental._id,
			name: rental.name,
		  	address: rental.address,
		  	lat: rental.lat, 
		  	lng: rental.lng, 
		  	type: rental.type,
		  	bikeNumber: rental.bikeNumber,
			self: "/api/v2/rentals/" + rental._id
		}
	}));
});

// ---------------------------------------------------------
// route to get rental point name
// ---------------------------------------------------------
router.get('/name', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the rental points 
	//until payment will not be developed assign only bike to the rental point "Negozio"
	let rentalPoints = await RentalPoint.find({ 'type': 'Negozio' }, { name : 1});
	res.status(200).json(rentalPoints);
});

// ---------------------------------------------------------
// route to delete rental point
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

	let rental = await RentalPoint.findById(req.params.id);
	if(rental == null){
        return res.status(404).json({
            success: false,
            message: 'Rental Point not found'
        });
	}

	// remove the rental points
	await RentalPoint.deleteOne({_id: req.params.id});
	// remove all bike associated to this rental point
	await Bike.deleteMany({rentalPointName: rental.name});
	// remove all booking associated to this rental point
	await Booking.deleteMany({rentalPointName: rental.name});

	res.status(200).json({
		success: true,
		message: 'Rental Point deleted!'
	});    
});

// ---------------------------------------------------------
// route to update rental point info
// ---------------------------------------------------------
router.put('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	if(!req.params.id || !req.body.address || !req.body.lat || !req.body.lng || !req.body.type){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

	if(req.body.lat < -90 || req.body.lat > 90 || req.body.lng < -180 || req.body.lng > 180){
        res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    //update rental point in the db
	let result = await RentalPoint.updateOne({'_id': req.params.id}, 
								{$set: {
									'address': req.body.address,
									'lat': req.body.lat, 
									'lng': req.body.lng, 
									'type': req.body.type
								}});

	if(result.modifiedCount == 0){
		res.status(404).json({
			success: false,
			message: 'Rental Point not found'
		});
	}else{
		res.status(200).json({
			success: true,
			message: 'Rental point info updated!'
		});   
	}
});

// ---------------------------------------------------------
// route to get rental point based on the type
// ---------------------------------------------------------
router.get('/type', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	if(!req.query.type){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}
	
	let type = req.query.type;
	
	// find the rental points
	let rentalPoints = await RentalPoint.find({ 'type': type, 'bikeNumber': {$gt : 0 } });	
	res.status(200).json(rentalPoints.map(rental => {
		return {
			_id: rental._id,
			name: rental.name,
		  	address: rental.address,
		  	lat: rental.lat, 
		  	lng: rental.lng, 
		  	type: rental.type,
		  	bikeNumber: rental.bikeNumber,
			self: "/api/v2/rentals/" + rental._id
		}
	}));
});

// ---------------------------------------------------------
// route to get rental point based on the zone
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

	if(req.body.latitude < -90 || req.body.latitude > 90 || req.body.longitude < -180 || req.body.longitude > 180){
        res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

	let lat = parseFloat(req.query.latitude);
	let lng = parseFloat(req.query.longitude);
	let latV = 0.27;
	let lngV = 0.38;

	// find the rental points
	let rentalPoints = await RentalPoint.find({ 
		'lat': {$gte: lat - latV, $lte: lat+latV }, 
		'lng':{$gte: lng - lngV, $lte: lng+lngV }, 
		'bikeNumber': {$gt : 0 } 
	});
	
	res.status(200).json(rentalPoints.map(rental => {
		return {
			_id: rental._id,
			name: rental.name,
		  	address: rental.address,
		  	lat: rental.lat, 
		  	lng: rental.lng, 
		  	type: rental.type,
		  	bikeNumber: rental.bikeNumber,
			self: "/api/v2/rentals/" + rental._id
		}
	}));
});

// ---------------------------------------------------------
// route to get rental point based on the bike availability
// ---------------------------------------------------------
router.get('/date', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	if(!req.query.date){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

	let dateSearch = req.query.date;
	// find all the rental points
	let allRentalPoints = await RentalPoint.find({ });

	//find booking	
	let bookings = await Booking.aggregate([
		{ $match: { 
			date: { $gte: new Date(dateSearch),
					$lte: new Date(dateSearch) 
			}}}, 
		{ $group : { 
			_id : "$rentalPointName", 
			count : { $sum : 1 } 
		} }
	]);
	
	for(let i = 0; i < bookings.length; i++){
		for(let y = 0; y < allRentalPoints.length; y++){
			if(bookings[i]._id == allRentalPoints[y].name){
				allRentalPoints[y].bikeNumber -= bookings[i].count;
			}
		}
	}

	let rentalPoints = [];

	for(let i = 0; i < allRentalPoints.length; i++){
		if(allRentalPoints[i].bikeNumber > 0){
			rentalPoints.push(allRentalPoints[i]);
		}
	}

	res.status(200).json(rentalPoints.map(rental => {
		return {
			_id: rental._id,
			name: rental.name,
		  	address: rental.address,
		  	lat: rental.lat, 
		  	lng: rental.lng, 
		  	type: rental.type,
		  	bikeNumber: rental.bikeNumber,
			self: "/api/v2/rentals/" + rental._id  
		}
	}));

});

module.exports = router;