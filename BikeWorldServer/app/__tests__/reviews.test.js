const app = require('../app');
const request = require('supertest');
const mongoose = require('mongoose');
const Review = require('../models/review');
const Itinerary = require('../models/itinerary')
const tokenGenerator = require('../utils/tokenGenerator');

const agent = request.agent(app);

const token = tokenGenerator({username: "user", _id: new mongoose.Types.ObjectId().toString(), permissions: true });
Array.prototype.id = function(){
    return Review.prototype;
};

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

const reviewId = new mongoose.Types.ObjectId().toString();

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
    reviews: [ review1, review2 ]
};

const reqBody = { 
    title: "Commento 1",
    text: "Bel giro",
    stars: 4,
    author: "test_username",
}; 
/*
describe('POST /api/v2/itineraries/itineraryId/reviews', () => {

    describe('given incomplete or wrong parameters', () => {        
        it('should return a 400 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send();

            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], save: jest.fn()}, itinerary1);
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

        it('should return a 400 status code', async () =>{
            const reqBody = { 
                title: "Commento 1",
                text: "Bel giro",
                stars: 20,
                author: "test_username",
            };
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send(reqBody);
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const reqBody = { 
                title: "Commento 1",
                text: "Bel giro",
                stars: 20,
                author: "test_username",
            };

            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send(reqBody);

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });
    
    describe('given new review with valid data', () => {              

        it('should return a 201 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], save: jest.fn()}, itinerary1);
            jest.spyOn(Review, "create").mockReturnValueOnce(review1);
            const { statusCode, body } = await agent.post(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send(reqBody);
            
            expect(statusCode).toBe(201);
        });

        it('should return the created itinerary', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], save: jest.fn()}, itinerary1);
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

describe('GET /api/v2/itineraries/itineraryId/reviews', () => {

    describe('given itinerary not existing', () => {     

        it('should return a 404 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(404);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews`).set('x-access-token', token).send();

            const response = { success: false, message: `Itinerary with id: ${itineraryId1} not found.`};
            expect(body).toEqual(response);
        });
    });

    describe('given invalid itinerary id', () => {     

        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/sad48sa9/reviews`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/sad48sa9/reviews`).set('x-access-token', token).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });

    describe('given reviews stored in db', () => {              

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1, review2], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews`).send();
            
            expect(statusCode).toBe(200);
        });

        it('should return the list of reviews', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1, review2], save: jest.fn()}, itinerary1);
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
*/
/*
describe('DELETE /api/v2/itineraries/<itineraryId>/reviews/reviewId', () => {
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
        jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/dsad`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({remove: jest.fn(), save: jest.fn()}, itinerary1);
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
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({remove: jest.fn(), save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", token).send();
            
            expect(statusCode).toBe(200);
        });

        it('should return a message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({remove: jest.fn(), save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", token).send();

            const response ={
                _success: true,
                message: 'Review deleted!'
            }

            expect(body).toEqual(response);
        });
    });
    
});
*/
/*
describe('PUT /api/v2/itineraries/<itineraryId>/reviews/reviewId', () => {
    describe('given incomplete or wrong parameters', () => {        
        it('should return a 400 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set('x-access-token', token).send();

            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], save: jest.fn()}, itinerary1);
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
        jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], set: jest.fn(), save: jest.fn()}, itinerary1);
        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/dsad`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], set: jest.fn(), save: jest.fn()}, itinerary1);
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
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], set: jest.fn(), save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", token).send();
            
            expect(statusCode).toBe(200);
        });

        it('should return a message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1], set: jest.fn(), save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).set("x-access-token", token).send();

            const response ={
                _success: true,
                message: 'Review updated!'
            }

            expect(body).toEqual(response);
        });
    });
    
});
*/

describe('GET /api/v2/itineraries/itineraryId/reviews/reviewId', () => {

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

        it('should return a 404 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1, review2], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId}`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(404);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1, review2], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId}`).set('x-access-token', token).send();

            const response = { success: false, message: `Itinerary with id: ${itineraryId1} not found.`};
            expect(body).toEqual(response);
        });
    });

    describe('given invalid review id', () => {     

        it('should return a 400 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1, review2], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/dsadsa`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1, review2], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/dsadsa`).set('x-access-token', token).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'};
            expect(body).toEqual(response);
        });
    });

    describe('given reviews stored in db', () => {              

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1, review2], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).send();
            
            expect(statusCode).toBe(200);
        });

        it('should return the list of reviews', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce({reviews:[review1, review2], save: jest.fn()}, itinerary1);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`).send();

            const response = {
                _id: reviewId1,
                title: "Commento 1",
                text: "Bel giro",
                stars: 4,
                author: "git",   
                self: `/api/v2/itineraries/${itineraryId1}/reviews/${reviewId1}`
            };
            expect(body).toEqual(response);
        });
    });
});
