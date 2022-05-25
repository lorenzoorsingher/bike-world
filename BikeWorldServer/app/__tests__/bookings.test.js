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
const bikeId2 = new mongoose.Types.ObjectId().toString();
const rentalId = new mongoose.Types.ObjectId().toString();
const bookingId = new mongoose.Types.ObjectId().toString();
const bookingId2 = new mongoose.Types.ObjectId().toString();


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


//Test get bookings
describe('GET /api/v2/bookings', () => {
    describe("return the list of all bookings", () => {
        it("should return a 200 status code", async () => {            
            const booking = [{
                _id: bookingId, 
                username: "test_username", 
                date: "16-07-2022", 
                bikeCode: "Ax26", 
                releaseBikeCode: 253648, 
                rentalPointName: "Rental"
            },{
                _id: bookingId2, 
                username: "test_username2", 
                date: "17-07-2022", 
                bikeCode: "Ax26", 
                releaseBikeCode: 253657, 
                rentalPointName: "Rental"
            }];

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: true, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Booking, "find").mockReturnValueOnce(booking);
    
            const { statusCode, body } = await agent.get("/api/v2/bookings").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return the list of bookings info", async () => {
            const booking = [{
                _id: bookingId, 
                username: "test_username", 
                date: "26-07-2022", 
                bikeCode: "Ax26", 
                releaseBikeCode: 253648, 
                rentalPointName: "Rental"
            },{
                _id: bookingId2, 
                username: "test_username2", 
                date: "27-07-2022", 
                bikeCode: "Ax26", 
                releaseBikeCode: 253657, 
                rentalPointName: "Rental"
            }];

            const sessionResult = [
                {
                    _id: bookingId,
                    username: "test_username",
                    date: "26-07-2022",
                    bikeCode: "Ax26",
                    releaseBikeCode: 253648,
                    rentalPointName: "Rental",
                    self: "/api/v2/bookings/" + bookingId
                },{
                    _id: bookingId2,
                    username: "test_username2",
                    date: "27-07-2022",
                    bikeCode: "Ax26",
                    releaseBikeCode: 253657,
                    rentalPointName: "Rental",
                    self: "/api/v2/bookings/" + bookingId2
                }
            ]

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: true, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Booking, "find").mockReturnValueOnce(booking);
    
            const { statusCode, body } = await agent.get("/api/v2/bookings").set('x-access-token', _token)
                .send();
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("return the list of my bookings", () => {
        it("should return a 200 status code", async () => {            
            const booking = [{
                _id: bookingId, 
                username: "test_username", 
                date: "16-07-2022", 
                bikeCode: "Ax26", 
                releaseBikeCode: 253648, 
                rentalPointName: "Rental"
            },{
                _id: bookingId2, 
                username: "test_username", 
                date: "17-07-2022", 
                bikeCode: "Ax26", 
                releaseBikeCode: 253657, 
                rentalPointName: "Rental"
            }];

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Booking, "find").mockReturnValueOnce(booking);
    
            const { statusCode, body } = await agent.get("/api/v2/bookings").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return the list of bookings info", async () => {
            const booking = [{
                _id: bookingId, 
                username: "test_username", 
                date: "26-07-2022", 
                bikeCode: "Ax26", 
                releaseBikeCode: 253648, 
                rentalPointName: "Rental"
            },{
                _id: bookingId2, 
                username: "test_username", 
                date: "27-07-2022", 
                bikeCode: "Ax26", 
                releaseBikeCode: 253657, 
                rentalPointName: "Rental"
            }];

            const sessionResult = [
                {
                    _id: bookingId,
                    username: "test_username",
                    date: "26-07-2022",
                    bikeCode: "Ax26",
                    releaseBikeCode: 253648,
                    rentalPointName: "Rental",
                    self: "/api/v2/bookings/" + bookingId
                },{
                    _id: bookingId2,
                    username: "test_username",
                    date: "27-07-2022",
                    bikeCode: "Ax26",
                    releaseBikeCode: 253657,
                    rentalPointName: "Rental",
                    self: "/api/v2/bookings/" + bookingId2
                }
            ]

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Booking, "find").mockReturnValueOnce(booking);
    
            const { statusCode, body } = await agent.get("/api/v2/bookings").set('x-access-token', _token)
                .send();
            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.get("/api/v2/bookings").send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.get("/api/v2/bookings").send();    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.get("/api/v2/bookings").set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.get("/api/v2/bookings").set('x-access-token', '1234').send();
    
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

//Test get bikes available in a day in a rentalPoint
describe('GET /api/v2/bookings/bikeAvailable', () => {
    describe("return the list of all bike", () => {
        it("should return a 200 status code", async () => {            
            const booking = [{
                bikeCode: "Ax26"
            }];

            const bikePayload = [{
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            },{
                _id: bikeId2,
                code: "Ax27",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            } ]

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: true, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findBookingMock = jest.spyOn(Booking, "find").mockReturnValueOnce(booking);
            const findBikeMock = jest.spyOn(Bike, "find").mockReturnValueOnce(bikePayload);
    
            const { statusCode, body } = await agent.get("/api/v2/bookings/bikeAvailable?rentalPointName=Rental&date=16-07-2022").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return the list of bookings info", async () => {
            const booking = [{
                bikeCode: "Ax26"
            }];

            const bikePayload = [{
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            },{
                _id: bikeId2,
                code: "Ax27",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            } ]

            const sessionResult = [
                {
                    _id: bikeId2,
                    code: "Ax27",
                    model: "model",
                    type: "type",
                    rentalPointName: "Rental",
                    state: true,
                    self: "/api/v2/bikes/" + bikeId2
                }
            ]
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: true, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findBookingMock = jest.spyOn(Booking, "find").mockReturnValueOnce(booking);
            const findBikeMock = jest.spyOn(Bike, "find").mockReturnValueOnce(bikePayload);
    
            const { statusCode, body } = await agent.get("/api/v2/bookings/bikeAvailable?rentalPointName=Rental&date=16-07-2022").set('x-access-token', _token)
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.get("/api/v2/bookings/bikeAvailable").send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.get("/api/v2/bookings/bikeAvailable").send();    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.get("/api/v2/bookings/bikeAvailable").set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.get("/api/v2/bookings/bikeAvailable").set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given incomplete data", () => {
        it("should return a 400 status code", async () => {

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )
    
            const { statusCode, body } = await agent.get("/api/v2/bookings/bikeAvailable").set('x-access-token', _token)
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
    
            const { statusCode, body } = await agent.get("/api/v2/bookings/bikeAvailable").set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });
});


//Test delete booking
describe('DELETE /api/v2/bookings/:id', () => {
    describe("given the correct id", () => {
        it("should return a 200 status code", async () => { 
            const result = {
                deletedCount: 1
            }

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: true, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findBookingMock = jest.spyOn(Booking, "deleteOne").mockReturnValueOnce(result);
    
            const { statusCode, body } = await agent.delete("/api/v2/bookings/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return the list of bookings info", async () => {
            const result = {
                deletedCount: 1
            }

            const sessionResult = 
                {
                    success: true,
                    message: 'Booking deleted!'
                }
            
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: true, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findBookingMock = jest.spyOn(Booking, "deleteOne").mockReturnValueOnce(result);
    
            const { statusCode, body } = await agent.delete("/api/v2/bookings/"+bikeId).set('x-access-token', _token)
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.delete("/api/v2/bookings/bikeAvailable").send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.delete("/api/v2/bookings/bikeAvailable").send();    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.delete("/api/v2/bookings/bikeAvailable").set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.delete("/api/v2/bookings/bikeAvailable").set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("given the incorrect id", () => {
        it("should return a 404 status code", async () => { 
            const result = {
                deletedCount: 0
            }

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: true, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findBookingMock = jest.spyOn(Booking, "deleteOne").mockReturnValueOnce(result);
    
            const { statusCode, body } = await agent.delete("/api/v2/bookings/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return the list of bookings info", async () => {
            const result = {
                deletedCount: 0
            }

            const sessionResult = 
                {
                    success: false,
                    message: 'Booking not found'
                }
            
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: true, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findBookingMock = jest.spyOn(Booking, "deleteOne").mockReturnValueOnce(result);
    
            const { statusCode, body } = await agent.delete("/api/v2/bookings/"+bikeId).set('x-access-token', _token)
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });
});
