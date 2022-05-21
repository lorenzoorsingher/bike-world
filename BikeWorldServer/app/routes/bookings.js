const express = require('express');
const router = express.Router();
const Bike = require('../models/bike');
const Booking = require('../models/booking.js');
const verifyToken = require('../middleware/auth');

// ---------------------------------------------------------
// route to add new booking
// ---------------------------------------------------------
router.post('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    const releaseCode = Math.floor(Math.random()*1000000);
    const username = req.loggedUser.username;
    
    const newBooking = await Booking.create({
        username: username, 
        date: req.body.date, 
        bikeCode: req.body.bikeCode, 
        releaseBikeCode: releaseCode, 
        rentalPointName: req.body.rentalPointName
    });    
    
	res.status(200).json({
		success: true,
		message: 'New Booking added!'
	});

});


// ---------------------------------------------------------
// route to get bookings
// ---------------------------------------------------------
router.get('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
    // getting user information from token
    const username = req.loggedUser.username;
    const permissions =  req.loggedUser.permissions;

    // if admin return all bookings
    const bookings = await Booking.find( permissions ? {} : {'username': username} );

	res.status(200).json(bookings.map(booking => {
        return {
            _id: booking._id,
            username: booking.username,
            date: booking.date,
            bikeCode: booking.bikeCode,
            releaseBikeCode: booking.releaseBikeCode,
            rentalPointName: booking.rentalPointName
        }
    }));
});

// ---------------------------------------------------------
// route to get bikes of a rentalPoint available in a day
// ---------------------------------------------------------
router.get('/bikeAvailable', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
	let rentalPointName = req.query.rentalPointName;
    let date = req.query.date;

    let bookings = await Booking.find({ 'rentalPointName' : rentalPointName, 'date': date}, {bikeCode: 1})    
    let bookedBikeCodes = bookings.map(x => x.bikeCode);

	let allBikes = await Bike.find({ 'rentalPointName' : rentalPointName, 'state': true });	

    let freeBikes = allBikes.filter(bike => !bookedBikeCodes.includes(bike.code));

	res.status(200).json(freeBikes.map(bike => {
        return {
            _id: bike._id, 
            code: bike.code,
            model: bike.model,
            type: bike.type,
            rentalPointName: bike.rentalPointName,
            state: bike.state
        }
    }));
});

// ---------------------------------------------------------
// route to delete booking
// ---------------------------------------------------------
router.delete('/:id', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

	let result = await Booking.deleteOne({ _id: req.params._id});
    
    if(result.deletedCount == 0){
        res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }else{
        res.status(200).json({
            success: true,
            message: 'Booking deleted!'
        });        
    }
});


module.exports = router;