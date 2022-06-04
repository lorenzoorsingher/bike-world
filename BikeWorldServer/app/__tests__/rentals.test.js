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
var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )
const bikeId = new mongoose.Types.ObjectId().toString();
const rentalId = new mongoose.Types.ObjectId().toString();
const rental = {
    _id: rentalId,
    name: "Rental",
    address: "Via",
    lat: 44.36,
    lng: 11.28,
    type: "Negozio",
    bikeNumber: 0
};
const rental1 = {
    _id: rentalId,
    name: "Rental",
    address: "Via",
    lat: 44.36,
    lng: 11.28,
    type: "Negozio",
    bikeNumber: 2
};
const rentalId2 = new mongoose.Types.ObjectId().toString();
const rental2 = {
    _id: rentalId2,
    name: "Rental2",
    address: "Via2",
    lat: 44.40,
    lng: 11.17,
    type: "Negozio",
    bikeNumber: 3
}


//Test add new rental point
describe('POST /api/v2/rentals', () => {
    describe("given the name, address, lat, lng and type are valid", () => {
        it("should return a 201 status code", async () => {            
            const findMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(null);
            const createMock = jest.spyOn(Rental, "create").mockReturnValueOnce(rental);
    
            const { statusCode, body } = await agent.post("/api/v2/rentals").set('x-access-token', _token)
                .send({ name: "Rental", address: "Via", lat: 44.36, lng: 11.28, type: "Negozio"});
    
            expect(statusCode).toBe(201);     
        });
        
        it("should return the new rental point created info", async () => {
            const sessionResult = {
                success: true,
                message: 'New Rental Point added!',
                rental: {
                    _id: rentalId,
                    name: "Rental",
                    address: "Via",
                    lat: 44.36, 
                    lng: 11.28, 
                    type: "Negozio",
                    bikeNumber: 0,
                    self: "/api/v2/rentals/" + rentalId
                }
            }
            const findMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(null);
            const createMock = jest.spyOn(Rental, "create").mockReturnValueOnce(rental);
    
            const { statusCode, body } = await agent.post("/api/v2/rentals").set('x-access-token', _token)
                .send({ name: "Rental", address: "Via", lat: 44.36, lng: 11.28, type: "Negozio"});

            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {            
            const { statusCode, body } = await agent.post("/api/v2/rentals").send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.post("/api/v2/rentals").send();    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.post("/api/v2/rentals").set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.post("/api/v2/rentals").set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given the name already existing", () => {
        it("should return a 409 status code", async () => {
            const findMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(rental);
    
            const { statusCode, body } = await agent.post("/api/v2/rentals").set('x-access-token', _token)
                .send({ name: "Rental", address: "Via", lat: 44.36, lng: 11.28, type: "Negozio"});
    
            expect(statusCode).toBe(409);     
        });
        
        it("should return an error message", async () => {
            const sessionResult = {
                success: false,
                message: 'Creation rental point failed. Rental point already exists.'
            };
            const findMock = jest.spyOn(Rental, "findOne").mockReturnValueOnce(rental);
    
            const { statusCode, body } = await agent.post("/api/v2/rentals").set('x-access-token', _token)
                .send({ name: "Rental", address: "Via", lat: 44.36, lng: 11.28, type: "Negozio"});
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given incomplete or wrong data", () => {
        it("should return a 400 status code", async () => {
            const { statusCode, body } = await agent.post("/api/v2/rentals").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(400);     
        });
        
        it("should return an error message", async () => {
            const sessionResult = {
                success: false,
                message: 'Bad Request. Check docs for required parameters. /api/api-docs' 
            };
            const { statusCode, body } = await agent.post("/api/v2/rentals").set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

});

//Test get rental point
describe('GET /api/v2/rentals', () => {
    describe("return all the rental point with bikeNumber>0", () => {
        it("should return a 200 status code", async () => {  
            const findMock = jest.spyOn(Rental, "find").mockReturnValueOnce([rental1, rental2]);
    
            const { statusCode, body } = await agent.get("/api/v2/rentals")
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a list of rental point info", async () => { 

            const sessionResult = [{
                    _id: rentalId,
                    name: "Rental",
                    address: "Via",
                    lat: 44.36,
                    lng: 11.28,
                    type: "Negozio",
                    bikeNumber: 2,
                    self: "/api/v2/rentals/" + rentalId
                },{
                    _id: rentalId2,
                    name: "Rental2",
                    address: "Via2",
                    lat: 44.40,
                    lng: 11.17,
                    type: "Negozio",
                    bikeNumber: 3,
                    self: "/api/v2/rentals/" + rentalId2
                }]

            const findMock = jest.spyOn(Rental, "find").mockReturnValueOnce([rental1, rental2]);
    
            const { statusCode, body } = await agent.get("/api/v2/rentals")
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });
});


//Test get rental point name of type "Negozio"
describe('GET /api/v2/rentals/name', () => {
    describe("return the name of rental point with bikeNumber>0 and type='Negozio'", () => {
        it("should return a 200 status code", async () => {            
            const rentalPayload = [{ name: "Rental" },{ name: "Rental2" }];
            const findMock = jest.spyOn(Rental, "find").mockReturnValueOnce(rentalPayload);
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/name")
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return the name of rental point", async () => {            
            const rentalPayload = [{ name: "Rental" },{ name: "Rental2" }];
            const sessionResult = [{ name: "Rental" },{ name: "Rental2" }]

            const findMock = jest.spyOn(Rental, "find").mockReturnValueOnce(rentalPayload);
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/name")
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });
});

//Test delete rental point
describe('DELETE /api/v2/rentals/:id', () => {
    describe("given the valid id", () => {
        it("should return a 200 status code", async () => {  
            const findMock = jest.spyOn(Rental, "findById").mockReturnValueOnce(rental1);
            const deleteRentalMock = jest.spyOn(Rental, "deleteOne").mockReturnValueOnce(null);
            const deleteBikeMock = jest.spyOn(Bike, "deleteMany").mockReturnValueOnce(null);
            const deleteBookingMock = jest.spyOn(Booking, "deleteMany").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.delete("/api/v2/rentals/"+rentalId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a message for rental point deleted", async () => {
            const sessionResult = {
                success: true,
                message: 'Rental Point deleted!'
            }
            const findMock = jest.spyOn(Rental, "findById").mockReturnValueOnce(rental1);
            const deleteRentalMock = jest.spyOn(Rental, "deleteOne").mockReturnValueOnce(null);
            const deleteBikeMock = jest.spyOn(Bike, "deleteMany").mockReturnValueOnce(null);
            const deleteBookingMock = jest.spyOn(Booking, "deleteMany").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.delete("/api/v2/rentals/"+rentalId).set('x-access-token', _token)
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.delete("/api/v2/rentals/"+rentalId).send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.delete("/api/v2/rentals/"+rentalId).send();    
            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.delete("/api/v2/rentals/"+rentalId).set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.delete("/api/v2/rentals/"+rentalId).set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("given an invalid rental id", () => {
        it("should return a 404 status code", async () => {
            const findMock = jest.spyOn(Rental, "findById").mockReturnValueOnce(null);
    
            const { statusCode, body } = await agent.post("/api/v2/rentals/"+rentalId).set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return an error message", async () => {
            const sessionResult = {
                success: false,
                message: 'Rental Point not found'
            };
            const findMock = jest.spyOn(Rental, "findById").mockReturnValueOnce(null);    
            const { statusCode, body } = await agent.delete("/api/v2/rentals/"+rentalId).set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    }); 
});

//Test update rental point
describe('PUT /api/v2/rentals/id', () => {
    describe("given the id, address, lat, lng and type are valid", () => {
        it("should return a 200 status code", async () => {            
            const result = {
                modifiedCount: 1
            }
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(result);
   
            const { statusCode, body } = await agent.put("/api/v2/rentals/"+rentalId).set('x-access-token', _token)
                .send({ address: "Via", lat: 44.36, lng: 11.28, type: "Negozio"});
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a message for rental point updated", async () => {
            const result = {
                modifiedCount: 1
            }

            const sessionResult = {
                success: true,
                message: 'Rental point info updated!'
            }
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(result);
    
            const { statusCode, body } = await agent.put("/api/v2/rentals/"+rentalId).set('x-access-token', _token)
                .send({ address: "Via", lat: 44.36, lng: 11.28, type: "Negozio"});

            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given the address, lat, lng and type are valid but different id", () => {
        it("should return a 404 status code", async () => { 
            const result = {
                modifiedCount: 0
            }
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(result);
            const { statusCode, body } = await agent.post("/api/v2/rentals/"+rentalId).set('x-access-token', _token)
                .send({ address: "Via", lat: 44.36, lng: 11.28, type: "Negozio"});
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return an error message", async () => {
            const sessionResult = {
                success: false,
                message: 'Rental Point not found'
            }
            const result = {
                modifiedCount: 0
            }
            const updateMock = jest.spyOn(Rental, "updateOne").mockReturnValueOnce(result);
    
            const { statusCode, body } = await agent.put("/api/v2/rentals/"+rentalId).set('x-access-token', _token)
                .send({ address: "Via", lat: 44.36, lng: 11.28, type: "Negozio"});

            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("don't pass token", () => {
        it("should return a 401 status code", async () => {
            
            const { statusCode, body } = await agent.put("/api/v2/rentals/"+rentalId).send();
            expect(statusCode).toBe(401);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
    
            const { statusCode, body } = await agent.put("/api/v2/rentals/"+rentalId).send();    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("pass invalid token", () => {
        it("should return a 403 status code", async () => {
            
            const { statusCode, body } = await agent.put("/api/v2/rentals/"+rentalId).set('x-access-token', '1234').send();
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
    
            const { statusCode, body } = await agent.put("/api/v2/rentals/"+rentalId).set('x-access-token', '1234').send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given incomplete data", () => {
        it("should return a 400 status code", async () => {
            const { statusCode, body } = await agent.post("/api/v2/rentals").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(400);     
        });
        
        it("should return an error message", async () => {
            const sessionResult = {
                success: false,
                message: 'Bad Request. Check docs for required parameters. /api/api-docs' 
            };
            const { statusCode, body } = await agent.post("/api/v2/rentals").set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });
});

//Test rental point based on type
describe('GET /api/v2/rentals/type', () => {
    describe("return the rental point with bikeNumber>0 and selected type", () => {
        it("should return a 200 status code", async () => {    
            const findMock = jest.spyOn(Rental, "find").mockReturnValueOnce([rental1, rental2]);
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/type?type=Negozio")
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a list of rental point based on availability in a date", async () => {   
            const sessionResult = [{
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 2,
                self: "/api/v2/rentals/" + rentalId
            },{
                _id: rentalId2,
                name: "Rental2",
                address: "Via2",
                lat: 44.40,
                lng: 11.17,
                type: "Negozio",
                bikeNumber: 3,
                self: "/api/v2/rentals/" + rentalId2
            }]

            const findMock = jest.spyOn(Rental, "find").mockReturnValueOnce([rental1, rental2]);
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/type?type=Negozio")
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });


    describe("don't give type", () => {
        it("should return a 400 status code", async () => {            
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/type")
                .send();
    
            expect(statusCode).toBe(400);     
        });
        
        it("should return an error message", async () => {  
            const sessionResult = {
                success: false,
                message: 'Bad Request. Check docs for required parameters. /api/api-docs' 
            }
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/type")
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });
});


//Test rental point based on zone
describe('GET /api/v2/rentals/zone', () => {
    describe("return the rental point with bikeNumber>0 and in a zone", () => {
        it("should return a 200 status code", async () => {  
            const findMock = jest.spyOn(Rental, "find").mockReturnValueOnce([rental1, rental2]);
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/zone?latitude=44.38&longitude=11.20")
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a list of rental point based on zone", async () => {      
            const sessionResult = [{
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 2,
                self: "/api/v2/rentals/" + rentalId
            },{
                _id: rentalId2,
                name: "Rental2",
                address: "Via2",
                lat: 44.40,
                lng: 11.17,
                type: "Negozio",
                bikeNumber: 3,
                self: "/api/v2/rentals/" + rentalId2
            }]

            const findMock = jest.spyOn(Rental, "find").mockReturnValueOnce([rental1, rental2]);

            const { statusCode, body } = await agent.get("/api/v2/rentals/zone?latitude=44.38&longitude=11.20")
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });

    
    describe("don't give zone or incorrect", () => {
        it("should return a 400 status code", async () => {            
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/zone")
                .send();
    
            expect(statusCode).toBe(400);     
        });
        
        it("should return an error message", async () => {  
            const sessionResult = {
                success: false,
                message: 'Bad Request. Check docs for required parameters. /api/api-docs' 
            }
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/zone")
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });
});


//Test rental point based on date avaiilability
describe('GET /api/v2/rentals/date', () => {
    describe("return the rental point with bikeNumber>0 in a date", () => {
        it("should return a 200 status code", async () => {            
            const rentalPayload = [{
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 6
            },{
                _id: rentalId2,
                name: "Rental2",
                address: "Via2",
                lat: 44.40,
                lng: 11.17,
                type: "Negozio",
                bikeNumber: 4
            }];

            const bookings = [{
                    _id: "Rental",
                    count: 3
                },{
                    _id: "Rental2",
                    count: 4
                }
            ];

            const findMock = jest.spyOn(Rental, "find").mockReturnValueOnce(rentalPayload);
            const findBookingMock = jest.spyOn(Booking, "aggregate").mockReturnValueOnce(bookings);
    
            const date = '2022-07-16';
            const { statusCode, body } = await agent.get("/api/v2/rentals/date?date="+date)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a list of rental point with bike available in day selected", async () => {            
            const rentalPayload = [{
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 6
            },{
                _id: rentalId2,
                name: "Rental2",
                address: "Via2",
                lat: 44.40,
                lng: 11.17,
                type: "Negozio",
                bikeNumber: 4
            }];

            const bookings = [{
                    _id: "Rental",
                    count: 3
                },{
                    _id: "Rental2",
                    count: 4
                }
            ];

            const sessionResult = [{
                _id: rentalId,
                name: "Rental",
                address: "Via",
                lat: 44.36,
                lng: 11.28,
                type: "Negozio",
                bikeNumber: 3,
                self: "/api/v2/rentals/" + rentalId
            }]

            const findMock = jest.spyOn(Rental, "find").mockReturnValueOnce(rentalPayload);
            const findBookingMock = jest.spyOn(Booking, "aggregate").mockReturnValueOnce(bookings);
    
            const date = '20220716';
            const { statusCode, body } = await agent.get("/api/v2/rentals/date?date="+date)
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });
    
    
    describe("don't give date", () => {
        it("should return a 400 status code", async () => {            
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/date")
                .send();
    
            expect(statusCode).toBe(400);     
        });
        
        it("should return a valid token and user info", async () => {  
            const sessionResult = {
                success: false,
                message: 'Bad Request. Check docs for required parameters. /api/api-docs' 
            }
    
            const { statusCode, body } = await agent.get("/api/v2/rentals/date")
                .send();

            expect(body).toEqual(sessionResult);             
        });
    });
});
