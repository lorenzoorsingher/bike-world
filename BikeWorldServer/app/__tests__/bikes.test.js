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


//Test add new bike
describe('POST /api/v2/bikes', () => {
    describe("given the code, model, type and rentalPointName are valid", () => {
        it("should return a 201 status code", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };
            
            const rentalPayload = {
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 1
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findOne").mockReturnValueOnce(null);
            const findRentalMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(rentalPayload);
            const createMock = jest.spyOn(Bike, "create").mockReturnValueOnce(bikePayload);            
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.post("/api/v2/bikes").set('x-access-token', _token)
                .send({ code: "Ax26", model: "model", type: "type", rentalPointName: "Rental"});
    
            expect(statusCode).toBe(201);     
        });
        
        it("should return the bike created info", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };
            
            const rentalPayload = {
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 1
            };

            const sessionResult = {
                success: true,
                message: 'New Bike added!',
                bike: {
                    _id: bikeId,
                    code: "Ax26",
                    model: "model",
                    type: "type",
                    rentalPointName: "Rental",
                    state: true,
                    self: "/api/v2/bikes/" + bikeId
                }
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findOne").mockReturnValueOnce(null);
            const findRentalMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(rentalPayload);
            const createMock = jest.spyOn(Bike, "create").mockReturnValueOnce(bikePayload);
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.post("/api/v2/bikes").set('x-access-token', _token)
                .send({ code: "Ax26", model: "model", type: "type", rentalPointName: "Rental"});
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given non existing rental point name", () => {
        it("should return a 404 status code", async () => {           

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findOne").mockReturnValueOnce(null);
            const findRentalMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.post("/api/v2/bikes").set('x-access-token', _token)
                .send({ code: "Ax26", model: "model", type: "type", rentalPointName: "Rental"});
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return an error message", async () => {

            const sessionResult = {
                success: false,
                message: 'Creation bike failed. Rental Point not found'
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findOne").mockReturnValueOnce(null);
            const findRentalMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(null);

            const { statusCode, body } = await agent.post("/api/v2/bikes").set('x-access-token', _token)
                .send({ code: "Ax26", model: "model", type: "type", rentalPointName: "Rental"});
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.post("/api/v2/bikes").send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.post("/api/v2/bikes").send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.post("/api/v2/bikes").set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.post("/api/v2/bikes").set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given the code already existing", () => {
        it("should return a 409 status code", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: 1
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findOne").mockReturnValueOnce(bikePayload);
    
            const { statusCode, body } = await agent.post("/api/v2/bikes").set('x-access-token', _token)
                .send({ code: "Ax26", model: "model", type: "type", rentalPointName: "Rental"});
    
            expect(statusCode).toBe(409);     
        });
        
        it("should return an error message", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };

            const sessionResult = {
                success: false,
                message: 'Creation bike failed. Bike already exists.'
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findOne").mockReturnValueOnce(bikePayload);
    
            const { statusCode, body } = await agent.post("/api/v2/bikes").set('x-access-token', _token)
                .send({ code: "Ax26", model: "model", type: "type", rentalPointName: "Rental"});
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given incomplete data", () => {
        it("should return a 400 status code", async () => {

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )
    
            const { statusCode, body } = await agent.post("/api/v2/bikes").set('x-access-token', _token)
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

    
            const { statusCode, body } = await agent.post("/api/v2/bikes").set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

});


//Test get bike
describe('GET /api/v2/bikes', () => {
    describe("return array of bikes", () => {
        it("should return a 200 status code", async () => {
            const bikePayload = [{
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            }, {
                _id: bikeId2,
                code: "Ax27",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            }];
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "find").mockReturnValueOnce(bikePayload);
    
            const { statusCode, body } = await agent.get("/api/v2/bikes").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a list of bike", async () => {
            const bikePayload = [{
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            }, {
                _id: bikeId2,
                code: "Ax27",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            }];

            const sessionResult = 
                [{
                    _id: bikeId,
                    code: "Ax26",
                    model: "model",
                    type: "type",
                    self: "/api/v2/bikes/" + bikeId,
                    rentalPointName: "Rental",
                    state: true
                }, {
                    _id: bikeId2,
                    code: "Ax27",
                    model: "model",
                    type: "type",
                    self: "/api/v2/bikes/" + bikeId2,
                    rentalPointName: "Rental",
                    state: true
                }]
            ;

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "find").mockReturnValueOnce(bikePayload);
    
            const { statusCode, body } = await agent.get("/api/v2/bikes").set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.get("/api/v2/bikes").send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.get("/api/v2/bikes").send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.get("/api/v2/bikes").set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.get("/api/v2/bikes").set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });
});

//Test get a bike by code
describe('GET /api/v2/bikes/code', () => {
    describe("given the valid code", () => {
        it("should return a 200 status code", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findOne").mockReturnValueOnce(bikePayload);
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/code?code=Ax26").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return the bike selected info", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };
            
            const sessionResult = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true,
                self: "/api/v2/bikes/code/" + bikeId
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findOne").mockReturnValueOnce(bikePayload);
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/code?code=Ax26").set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.get("/api/v2/bikes/code").send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/code").send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.get("/api/v2/bikes/code").set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/code").set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given the uncorrect code", () => {
        it("should return a 404 status code", async () => {            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findOne").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/code?code=15264").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Bike not found'
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findOne").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/code?code=15264").set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given the incorrect code", () => {
        it("should return a 400 status code", async () => {            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/code").set('x-access-token', _token)
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
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/code").set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });
});


//Test get a bike
describe('GET /api/v2/bikes/:id', () => {
    describe("given the  valid id", () => {
        it("should return a 201 status code", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return the bike selected info", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };
            
            const sessionResult = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true,
                self: "/api/v2/bikes/" + bikeId
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.get("/api/v2/bikes").send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.get("/api/v2/bikes").send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.get("/api/v2/bikes").set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.get("/api/v2/bikes").set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given the incorrect id", () => {
        it("should return 404 a  status code", async () => {            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Bike not found'
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.get("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });
});

//Test delete a bike
describe('DELETE /api/v2/bikes/:id', () => {
    describe("given the  valid id", () => {
        it("should return a 200 status code", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };

            const rentalPayload = {
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 1
            };          
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
            const findRentalMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(rentalPayload);
            const deleteBookingMock = jest.spyOn(Booking, "deleteMany").mockReturnValueOnce(null);
            const deleteBikeMock = jest.spyOn(Bike, "deleteOne").mockReturnValueOnce(null);            
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(null);

            const { statusCode, body } = await agent.delete("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a message for bike deleted", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };

            const rentalPayload = {
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 1
            }; 
            
            const sessionResult = {
                success: true,
                message:"Bike deleted!"
            }
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
            const findRentalMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(rentalPayload);
            const deleteBookingMock = jest.spyOn(Booking, "deleteMany").mockReturnValueOnce(null);
            const deleteBikeMock = jest.spyOn(Bike, "deleteOne").mockReturnValueOnce(null);
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(null);

            const { statusCode, body } = await agent.delete("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send(); 
            expect(body).toEqual(sessionResult);             
        });
    });
    

    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.delete("/api/v2/bikes/"+bikeId).send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.delete("/api/v2/bikes/"+bikeId).send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.delete("/api/v2/bikes/"+bikeId).set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.delete("/api/v2/bikes/"+bikeId).set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given the unvalid id", () => {
        it("should return 404 a  status code", async () => {            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.delete("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Bike not found'
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.delete("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });
    /*
    describe("given the unvalid rental Point name", () => {
        it("should return 404 a  status code", async () => { 
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
            const findRentalPointMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.delete("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return an error message", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };

            const sessionResult = {
                success: false,
                message: 'Rental point not found'
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
            const findRentalPointMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(null)
    
            const { statusCode, body } = await agent.delete("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });
    */
});

//Test patch a bike
describe('PATCH /api/v2/bikes/:id', () => {
    describe("given the valid id and bike to repare", () => {
        it("should return a 201 status code", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };

            const rentalPayload = {
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 1
            };          
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
            const findRentalMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(rentalPayload);
            const updateBikeMock = jest.spyOn(Bike, "updateOne").mockReturnValueOnce(null);
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(null);

            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a message to repare the bike", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };

            const rentalPayload = {
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 1
            }; 
            
            const sessionResult = {
                success: true,
                message:"Bike put in reparation!"
            }
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
            const findRentalMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(rentalPayload);
            const updateBikeMock = jest.spyOn(Bike, "updateOne").mockReturnValueOnce(null);
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(null);

            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send(); 
            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("given the valid id and bike repared", () => {
        it("should return a 201 status code", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: false
            };

            const rentalPayload = {
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 1
            };          
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
            const findRentalMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(rentalPayload);
            const updateBikeMock = jest.spyOn(Bike, "updateOne").mockReturnValueOnce(null);
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(null);

            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a message to bike repared", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: false
            };

            const rentalPayload = {
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 1
            }; 
            
            const sessionResult = {
                success: true,
                message:"Bike repared!"
            }
            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
            const findRentalMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(rentalPayload);
            const updateBikeMock = jest.spyOn(Bike, "updateOne").mockReturnValueOnce(null);
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(null);

            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send(); 
            expect(body).toEqual(sessionResult);             
        });
    });    

    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given the unvalid bike id", () => {
        it("should return 404 a  status code", async () => {            
            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Bike not found'
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    /*
    describe("given the unvalid rental Point name", () => {
        it("should return 404 a  status code", async () => { 
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
            const findRentalPointMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return an error message", async () => {
            const bikePayload = {
                _id: bikeId,
                code: "Ax26",
                model: "model",
                type: "type",
                rentalPointName: "Rental",
                state: true
            };

            const sessionResult = {
                success: false,
                message: 'Rental point not found'
            };

            // create a valid token
            var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )

            const findMock = jest.spyOn(Bike, "findById").mockReturnValueOnce(bikePayload);
            const findRentalPointMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(null)
    
            const { statusCode, body } = await agent.patch("/api/v2/bikes/"+bikeId).set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });
    */

});
