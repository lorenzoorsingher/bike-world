const express = require('express');
const router = express.Router();
const Bike = require('../models/bike'); // get our mongoose model
const RentalPoint = require('../models/rentalPoint'); // get our mongoose model
const Booking = require('../models/booking.js') // get booking model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

// ---------------------------------------------------------
// route to add new booking
// ---------------------------------------------------------
router.post('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    //get all booking for that specific day and rental point
    const bookingNumber = await Booking.count({
        day: req.body.day,
        month: req.body.month,
        year: req.body.year,
        rentalPointName: req.body.rentalPointName
    })

    //find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.body.rentalPointName
	}).exec();

    if(rentalPoint.bikeNumber - bookingNumber == 0){
        res.json({ success: false, message: 'Non ci sono biciclette disponibili'});
		return;	//to stop the execution of the function	
    }    

    //save booking in the db
    const newBooking = new Booking({username: req.body.username, day: req.body.day, month: req.body.month, year: req.body.year, bikeCode: req.body.bikeCode, rentalPointName: req.body.rentalPointName});
    await newBooking.save();
    
	res.json({
		success: true,
		message: 'New Booking added!'
	});

});


// ---------------------------------------------------------
// route to get bookings
// ---------------------------------------------------------
router.get('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
    let username = req.query.username;

	// get the bookings
	let bookings = await Booking.find( { 'username': username }).exec();	
    console.log(bookings);
	res.json({bookings});
});

// ---------------------------------------------------------
// route to get bike searched by code
// ---------------------------------------------------------
router.get('/code', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the bike
	let bike = await Bike.findOne( { 'code': req.query.code }).exec();
	res.json({bike});
});

// ---------------------------------------------------------
// route to delete bike
// ---------------------------------------------------------
router.delete('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	console.log(req.query.code);
	// remove the bike
	await Bike.deleteOne( { code: req.query.code}).exec();

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.query.rentalPointName
	}).exec();

	//remove bike from rental Point
	await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber - 1}});

	res.json({
		success: true,
		message: 'Bike deleted!'
	});
});

// ---------------------------------------------------------
// route to repare bike
// ---------------------------------------------------------
router.put('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	// find the bike
	let bike = await Bike.findOne({
		name: req.body.code
	}).exec();

	//find the rental Point
	let rentalPoint = await RentalPoint.findOne({
		name: req.body.rentalPointName
	}).exec();

	if(bike.state == true){
		//put bike in reparation
		await Bike.updateOne({'code': req.body.code}, {$set: {'state': false}});

		//remove bike from rental Point
		await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber - 1}});

		res.json({
			success: true,
			message: 'Bike put in reparation!'
		});
	} else {
		//repare bike
		await Bike.updateOne({'code': req.body.code}, {$set: {'state': true}});

		//add bike from rental Point
		await RentalPoint.updateOne({'name': rentalPoint.name}, {$set: {'bikeNumber': rentalPoint.bikeNumber + 1}});

		res.json({
			success: true,
			message: 'Bike repared!'
		});
	}

});

module.exports = router;