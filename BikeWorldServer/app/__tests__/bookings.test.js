const app = require('../app');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Bike = require('../models/bike');
const Booking = require('../models/booking');
const Rental = require('../models/rentalPoint');
const jwt = require("jsonwebtoken");
const tokenGenerator = require('../utils/tokenGenerator');

const agent = request.agent(app);

const userId = new mongoose.Types.ObjectId().toString();
const bikeId = new mongoose.Types.ObjectId().toString();
const rentalId = new mongoose.Types.ObjectId().toString();
const bookingId = new mongoose.Types.ObjectId().toString();


//Test add new booking
describe('POST /api/v2/bookings', () => {
    describe("given the date, bikeCode, rentaPointName are valid", () => {
        it("should return a 201 status code", async () => {            
            const booking = {
                _id: bookingId, 
                username: "test_username", 
                date: "16-07-2022", 
                bikeCode: "Ax26", 
                releaseBikeCode: 253648, 
                rentalPointName: "Rental"
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const createMock = jest.spyOn(Booking, "create").mockReturnValueOnce(booking);
    
            const { statusCode, body } = await agent.post("/api/v2/bookings").set('x-access-token', _token)
                .send({ date: "16-07-2022", bikeCode: "Ax26", releaseBikeCode: 253648, rentalPointName: "Rental"});
    
            expect(statusCode).toBe(201);     
        });
        
        it("should return the new rental point created info", async () => {
            const booking = {
                _id: bookingId, 
                username: "test_username", 
                date: "26-07-2022", 
                bikeCode: "Ax26", 
                releaseBikeCode: 253648, 
                rentalPointName: "Rental"
            };

            const sessionResult = {
                success: true,
                message: 'New Booking added!',
                booking: {
                    _id: bookingId,
                    username: "test_username",
                    date: "26-07-2022",
                    bikeCode: "Ax26",
                    releaseBikeCode: 253648,
                    rentalPointName: "Rental",
                    self: "/api/v2/bookings/" + bookingId
                }
            }

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const createMock = jest.spyOn(Booking, "create").mockReturnValueOnce(booking);
    
            const { statusCode, body } = await agent.post("/api/v2/bookings").set('x-access-token', _token)
                .send({ date: "16-07-2022", bikeCode: "Ax26", releaseBikeCode: 253648, rentalPointName: "Rental"});

            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.post("/api/v2/bookings").send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.post("/api/v2/bookings").send();    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.post("/api/v2/bookings").set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.post("/api/v2/bookings").set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given incomplete data", () => {
        it("should return a 400 status code", async () => {

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )
    
            const { statusCode, body } = await agent.post("/api/v2/bookings").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(400);     
        });
        
        it("should return an error message", async () => {

            const sessionResult = {
                success: false,
                message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' 
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )
    
            const { statusCode, body } = await agent.post("/api/v2/bookings").set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

});
