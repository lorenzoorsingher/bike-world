const app = require('../app');
const request = require('supertest');
const mongoose = require('mongoose');
const Review = require('../models/review');
const Itinerary = require('../models/itinerary')
const tokenGenerator = require('../utils/tokenGenerator');

const agent = request.agent(app);

const userToken = {username: "test_username", _id: new mongoose.Types.ObjectId().toString(), permissions: true };
const token = tokenGenerator(userToken);

const reviewId1 = new mongoose.Types.ObjectId().toString();
const review1 = {
    _id: reviewId1,
    title: "Commento 1",
    text: "Bel giro",
    stars: 4,
    author: "test_username",
};

const reviewId2 = new mongoose.Types.ObjectId().toString();
const review2 = {
    _id: reviewId2,
    title: "Commento 1",
    text: "Bel giro",
    stars: 3,
    author: "test_username2",
};

const itinerary1Reviews = [ review1, review2 ];

/**
 * Adding id to Array prototype to simulate MongooseDocumentArray.prototype.id()
 * @param {*} _id 
 * @returns the object with that _id 
 */
itinerary1Reviews.id = function(_id) {    
    let r = this.find(x => x._id == _id);

    if(r == null) return null;
    /**
    * Adding remove to Array prototype to simulate MongooseDocumentArray.prototype.remove()
    */
    r.remove = function(){};

    /**
    * Adding set to Array prototype to simulate MongooseDocumentArray.prototype.set()
    */
    r.set = function(){};

    return r;
}

/**
 * Overriding push of Array prototype to mock MongooseDocumentArray.prototype.push() 
 */
 itinerary1Reviews.push = () => {};

const itineraryId1 = new mongoose.Types.ObjectId().toString();
const itinerary1 = {
    _id: itineraryId1,
    name: "name",
    addressStarting: "Add",
    latS: 40.5,
    lngS: 50.2,
    description: "desc",
    difficulty: "Principiante",
    length: 12.5,
    reviews: itinerary1Reviews,

    save: jest.fn(()=>{  })
};

const reqBody = { 
    title: "Commento 1",
    text: "Bel giro",
    stars: 4,
    author: "test_username",
}; 

describe('POST /api/v2/itineraries/:itineraryId/reviews', () => {

    describe('given incomplete or wrong parameters', () => {        
        it('should return a 400 status code', async () =>{            
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send();

            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{      
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);      
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' };
            expect(body).toEqual(response);
        });
    });

    describe('given invalid itinerary id', () => {     

        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/sad48sa9/reviews`).set('x-access-token', token).send(reqBody);
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/sad48sa9/reviews`).set('x-access-token', token).send(reqBody);

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });

    describe('given itinerary not existing', () => {     

        it('should return a 404 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send();

            expect(statusCode).toBe(404);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send();

            const response = { success: false, message: `Itinerary with id: ${itineraryId1} not found.`};
            expect(body).toEqual(response);
        });
    });

    describe('given not valid stars', () => {     
        const reqBody = { 
            title: "Commento 1",
            text: "Bel giro",
            stars: 20,
            author: "test_username",
        };

        it('should return a 400 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send(reqBody);
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send(reqBody);

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });
    
    describe('given new review with valid data', () => {              

        it('should return a 201 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            jest.spyOn(Review, "create").mockReturnValueOnce(review1);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send(reqBody);
            
            expect(statusCode).toBe(201);
        });

        it('should return the created itinerary', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            jest.spyOn(Review, "create").mockReturnValueOnce(review1);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send(reqBody);

            const response = {
                success: true,
                message: 'New Review added!',
                review: {
                    _id: reviewId1,
                    title: "Commento 1",
                    text: "Bel giro",
                    stars: 4,
                    author: "test_username",
                    self: `/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`
                }
            };
            expect(body).toEqual(response);
        });
    });

});

describe('GET /api/v2/itineraries/:itineraryId/reviews', () => {

    describe('given itinerary not existing', () => {     

        it('should return a 404 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews`).send();
            
            expect(statusCode).toBe(404);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews`).send();

            const response = { success: false, message: `Itinerary with id: ${itineraryId1} not found.`};
            expect(body).toEqual(response);
        });
    });

    describe('given invalid itinerary id', () => {     

        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/sad48sa9/reviews`).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/sad48sa9/reviews`).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });

    describe('given reviews stored in db', () => {              

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews`).send();
            
            expect(statusCode).toBe(200);
        });

        it('should return the list of reviews', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews`).send();

            const response = [
                {
                    _id: reviewId1,
                    title: "Commento 1",
                    text: "Bel giro",
                    stars: 4,
                    author: "test_username",   
                    self: `/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`
                },
                {
                    _id: reviewId2,
                    title: "Commento 1",
                    text: "Bel giro",
                    stars: 3,
                    author: "test_username2",   
                    self: `/api/v2/itineraries/${itineraryId1}/reviews/${reviewId2}`
                }
            ];
            
            expect(body).toEqual(response);
        });
    });
});

describe('DELETE /api/v2/itineraries/:itineraryId/reviews/:reviewId', () => {
   
    describe('given itinerary not existing', () => {     

        it('should return a 404 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set('x-access-token', token).send();

            expect(statusCode).toBe(404);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set('x-access-token', token).send();

            const response = { success: false, message: `Itinerary with id: ${itineraryId1} not found.`};
            expect(body).toEqual(response);
        });
    });

    describe('given invalid itinerary id', () => {     

        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/sad48sa9/reviews/${reviewId1}`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/sad48sa9/reviews/${reviewId1}`).set('x-access-token', token).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });

    describe('given invalid review id', () => {     
        it('should return a 400 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/dsad`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/dsad`).set('x-access-token', token).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });

    describe("request without valid token", () => {
        it("should return a 403 status code", async () => {
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", "noValidToken")
                .send();    
            expect(statusCode).toBe(403);     
        });

        it("should return the error message", async () => {
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", "noValidToken")
                .send();    
            
            expect(body).toEqual(sessionResult);          
        });
    });

    describe('delete review stored in db', () => {              

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", token).send();
            
            expect(statusCode).toBe(200);
        });

        it('should return a message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", token).send();

            const response ={
                success: true,
                message: 'Review deleted!'
            }

            expect(body).toEqual(response);
        });
    });
    
});


describe('PUT /api/v2/itineraries/:itineraryId/reviews/:reviewId', () => {
    describe('given incomplete or wrong parameters', () => {        
        it('should return a 400 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set('x-access-token', token).send();

            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set('x-access-token', token).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' };
            expect(body).toEqual(response);
        });
    });

    describe('given itinerary not existing', () => {     

        it('should return a 404 status dode', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set('x-access-token', token).send();

            expect(statusCode).toBe(404);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set('x-access-token', token).send();

            const response = { success: false, message: `Itinerary with id: ${itineraryId1} not found.`};
            expect(body).toEqual(response);
        });
    });

    describe('given invalid itinerary id', () => {     

        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/sad48sa9/reviews/${reviewId1}`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/sad48sa9/reviews/${reviewId1}`).set('x-access-token', token).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });

    describe('given invalid review id', () => {     
        it('should return a 400 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/dsad`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/dsad`).set('x-access-token', token).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });

    describe("request without valid token", () => {
        it("should return a 403 status code", async () => {
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", "noValidToken")
                .send();    
            expect(statusCode).toBe(403);     
        });

        it("should return the error message", async () => {
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", "noValidToken")
                .send();    
            
            expect(body).toEqual(sessionResult);          
        });
    });

    describe('update review stored in db', () => {              

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", token).send(reqBody);
            
            expect(statusCode).toBe(200);
        });

        it('should return a message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", token).send(reqBody);

            const response ={
                success: true,
                message: 'Review info updated!'
            }

            expect(body).toEqual(response);
        });
    });
    
});


describe('GET /api/v2/itineraries/:itineraryId/reviews/:reviewId', () => {

    describe('given itinerary not existing', () => {     

        it('should return a 404 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(404);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set('x-access-token', token).send();

            const response = { success: false, message: `Itinerary with id: ${itineraryId1} not found.`};
            expect(body).toEqual(response);
        });
    });

    describe('given invalid itinerary id', () => {     

        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/sad48sa9/reviews/${reviewId1}`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/sad48sa9/reviews/${reviewId1}`).set('x-access-token', token).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });

    describe('given review not existing', () => {     
        const notExistingId = new mongoose.Types.ObjectId();

        it('should return a 404 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/${notExistingId}`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(404);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/${notExistingId}`).set('x-access-token', token).send();

            const response = { success: false, message: `Review with id: ${notExistingId} not found.`};
            expect(body).toEqual(response);
        });
    });

    describe('given invalid review id', () => {     

        it('should return a 400 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/dsadsa`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/dsadsa`).set('x-access-token', token).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });

    describe('given reviews stored in db', () => {              

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).send();
            
            expect(statusCode).toBe(200);
        });

        it('should return the list of reviews', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).send();

            const response = {
                _id: reviewId1,
                title: "Commento 1",
                text: "Bel giro",
                stars: 4,
                author: "test_username",   
                self: `/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`
            };
            expect(body).toEqual(response);
        });
    });
});
