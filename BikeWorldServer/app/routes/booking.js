const express = require('express');
const router = express.Router();
const Bike = require('../models/bike'); // get our mongoose model
const RentalPoint = require('../models/rentalPoint'); // get our mongoose model
const Booking = require('../models/booking.js') // get booking model
const User = require('../models/user.js'); // get user model
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
        date: req.body.date,
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

    let releaseCode = Math.floor(Math.random()*1000000);

    //save booking in the db
    const newBooking = new Booking({username: req.body.username, date: req.body.date, bikeCode: req.body.bikeCode, releaseBikeCode: releaseCode, rentalPointName: req.body.rentalPointName});
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

    let user = await User.findOne({'username': username});

	// get the bookings
	let bookings;
    
    if(user.permissions == true){
        bookings = await Booking.find().exec();
    } else {
        bookings = await Booking.find( { 'username': username }).exec();
    }
	res.json({bookings});
});

// ---------------------------------------------------------
// route to get bikes of a rentalPoint available in a day
// ---------------------------------------------------------
router.get('/bikeAvailable', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	let rentalPointName = req.query.rentalPointName;
    let date = req.query.date;

    let bikeCodes = await Booking.find({ 'rentalPointName' : rentalPointName, 'date': date}, {bikeCode: 1})
    let bikeCode = [];

    for(let i = 0; i < bikeCodes.length; i++){
        bikeCode.push(bikeCodes[i].bikeCode);
    }

	// get the bikes
	let allBikes = await Bike.find( { 'rentalPointName' : rentalPointName, 'state': true }).exec();	
    let bikes = [];

    for(let i = 0; i < allBikes.length; i++){
        if(!bikeCode.includes(allBikes[i].code)){
            bikes.push(allBikes[i]);
        }
    }

	res.json({bikes});
});

// ---------------------------------------------------------
// route to delete booking
// ---------------------------------------------------------
router.delete('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	// remove the booking
	await Booking.deleteOne( { _id: req.query._id}).exec();

	res.json({
		success: true,
		message: 'Booking deleted!'
	});
});


module.exports = router;