const express = require('express');
const router = express.Router();
const Bike = require('../../models/bike');
const Booking = require('../../models/booking.js');
const verifyToken = require('../../middleware/auth');

// ---------------------------------------------------------
// route to add new booking
// ---------------------------------------------------------
router.post('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    if(!req.body.date || !req.body.bikeCode || !req.body.rentalPointName){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/api-docs' });	
		return;
	}

    const releaseCode = Math.floor(Math.random()*1000000);
    const username = req.loggedUser.username;
    
    const newBooking = await Booking.create({
        username: username, 
        date: req.body.date, 
        bikeCode: req.body.bikeCode, 
        releaseBikeCode: releaseCode, 
        rentalPointName: req.body.rentalPointName
    });    
    
	res.status(201).json({
		success: true,
		message: 'New Booking added!',
        booking: {
            _id: newBooking._id,
            username: newBooking.username,
            date: newBooking.date,
            bikeCode: newBooking.bikeCode,
            releaseBikeCode: newBooking.releaseBikeCode,
            rentalPointName: newBooking.rentalPointName,
            self: "/api/v2/bookings/" + newBooking._id
        }
	});

});


// ---------------------------------------------------------
// route to get bookings of a user (all users if admin)
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
    let bookings = null;
    if(permissions){
        bookings = await Booking.find({});
    }else {
        //until payment will not be developed assign only bike to the rental point "Negozio"
        //after allowing payment show releaseBikeCode only if payment is done
        bookings = await Booking.find({'username': username}, {'releaseBikeCode': 0});
    }

	res.status(200).json(bookings.map(booking => {
        return {
            _id: booking._id,
            username: booking.username,
            date: booking.date,
            bikeCode: booking.bikeCode,
            releaseBikeCode: booking.releaseBikeCode,
            rentalPointName: booking.rentalPointName,
            self: "/api/v2/bookings/" + booking._id
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
	
    if(!req.query.rentalPointName || !req.query.date){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/api-docs' });	
		return;
	}
    
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
            state: bike.state,
            self: "/api/v2/bikes/" + bike._id
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

    if(!req.params.id){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/api-docs' });	
		return;
	}

	let result = await Booking.deleteOne({ _id: req.params.id});
    
    if(result.deletedCount == 0){
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }else{
         return res.status(200).json({
            success: true,
            message: 'Booking deleted!'
        });        
    }
});


module.exports = router;