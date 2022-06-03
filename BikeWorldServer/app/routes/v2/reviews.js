const express = require('express');
const router = express.Router({ mergeParams: true }); // needed for passing url params tu sub router
const Itinerary = require('../../models/itinerary');
const Review = require('../../models/review');
const verifyToken = require('../../middleware/auth');
const review = require('../../models/review');
const isObjectIdValid = require('../../utils/objectIdValidator');

// ---------------------------------------------------------
// route to add new review
// ---------------------------------------------------------
router.post('', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);    
    
    const itineraryId =  req.params.itineraryId;
    if(!isObjectIdValid(itineraryId)){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    let itinerary = await Itinerary.findById(itineraryId);
    if(itinerary == null){
        res.status(404).json({
            success: false,
            message: `Itinerary with id: ${itineraryId} not found.`
        });
        return;
    }
        
	if(!req.body.title || !req.body.text || isNaN(parseInt(req.body.stars))){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

    const stars = req.body.stars;
    if(stars < 0 || stars > 5){
        res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

	const loggedUsername = req.loggedUser.username;

    const newReview = await Review.create({
        title: req.body.title,
        text: req.body.text,
        author: loggedUsername,
        stars: parseInt(req.body.stars)
	});

    itinerary.reviews.push(newReview);
    itinerary.save();

	res.status(201).json({
		success: true,
		message: 'New Review added!',
		review: {
			_id: newReview._id,
            title: newReview.title,
            text: newReview.text,
            stars: newReview.stars,
            author: newReview.author,
			self: `/api/v2/itineraries/${itineraryId}/reviews/${newReview._id}`
		}
	});
});

// ---------------------------------------------------------
// route to get reviews of a itinerary
// ---------------------------------------------------------
router.get('', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    
    const itineraryId =  req.params.itineraryId;
    if(!isObjectIdValid(itineraryId)){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    let itinerary = await Itinerary.findById(itineraryId);
    if(itinerary == null){
        res.status(404).json({
            success: false,
            message: `Itinerary with id: ${itineraryId} not found.`
        });
        return;
    }

    const reviews = itinerary.reviews;
    
	res.status(200).json(reviews.map(review => {
		return {
			_id: review._id,
            title: review.title,
            text: review.text,
            stars: review.stars,
            author: review.author,
			self: `/api/v2/itineraries/${itineraryId}/reviews/${review._id}`
		}
	}));
});

// ---------------------------------------------------------
// route to delete review
// ---------------------------------------------------------
router.delete('/:reviewId', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);

    const itineraryId =  req.params.itineraryId;
    if(!isObjectIdValid(itineraryId)){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    let itinerary = await Itinerary.findById(itineraryId);
    if(itinerary == null){
        res.status(404).json({
            success: false,
            message: `Itinerary with id: ${itineraryId} not found.`
        });
        return;
    }

    const reviewId = req.params.reviewId;
    if(!isObjectIdValid(reviewId)){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    const review = await itinerary.reviews.id(reviewId);  

    const loggedUsername = req.loggedUser.username;
    if(loggedUsername != review.author && !req.loggedUser.permissions){
        return res.status(401).json({
			success: false,
			message: "Unauthorized. You can access only your reviews."
		});
    }

    review.remove();
    await itinerary.save();

	res.status(200).json({
		success: true,
		message: 'Review deleted!'
	});    
});

// ---------------------------------------------------------
// route to update review info
// ---------------------------------------------------------
router.put('/:reviewId', verifyToken, async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Accept, Origin');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
    const itineraryId =  req.params.itineraryId;
    if(!isObjectIdValid(itineraryId)){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    let itinerary = await Itinerary.findById(itineraryId);
    if(itinerary == null){
        res.status(404).json({
            success: false,
            message: `Itinerary with id: ${itineraryId} not found.`
        });
        return;
    }

    if(!req.body.title || !req.body.text || isNaN(parseInt(req.body.stars))){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
	}

    const stars = req.body.stars;
    if(stars < 0 || stars > 5){
        res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    const reviewId = req.params.reviewId;
    if(!isObjectIdValid(reviewId)){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    let review = await itinerary.reviews.id(reviewId);
    if(review == null){
        res.status(404).json({
            success: false,
            message: `Review with id: ${reviewId} not found.`
        });
        return;
    }

    const loggedUsername = req.loggedUser.username;
    if(loggedUsername != review.author){
        return res.status(401).json({
			success: false,
			message: "Unauthorized. You can access only your reviews."
		});
    }
        
    review.set({
        title: req.body.title,
        text: req.body.text,
        author: loggedUsername,
        stars: parseInt(req.body.stars)
    });
    await itinerary.save();

    res.status(200).json({
        success: true,
        message: 'Review info updated!'
    }); 
});

// ---------------------------------------------------------
// route to get a review
// ---------------------------------------------------------
router.get('/:reviewId', async function(req, res) {
	res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
	
    const itineraryId =  req.params.itineraryId;
    if(!isObjectIdValid(itineraryId)){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    let itinerary = await Itinerary.findById(itineraryId);
    if(itinerary == null){
        res.status(404).json({
            success: false,
            message: `Itinerary with id: ${itineraryId} not found.`
        });
        return;
    }

    const reviewId = req.params.reviewId;
    if(!isObjectIdValid(reviewId)){
		res.status(400).json({ success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' });	
		return;
    }

    let review = itinerary.reviews.id(reviewId);
    if(review == null){
        res.status(404).json({
            success: false,
            message: `Review with id: ${reviewId} not found.`
        });
        return;
    }

    res.status(200).json({
        _id: review._id,
        title: review.title,
        text: review.text,
        stars: review.stars,
        author: review.author,
        self: `/api/v2/itineraries/${itineraryId}/reviews/${review._id}`
    }); 
});

module.exports = router;