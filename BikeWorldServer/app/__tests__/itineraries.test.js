const app = require('../app');
const request = require('supertest');
const mongoose = require('mongoose');
const Itinerary = require('../models/itinerary');
const tokenGenerator = require('../utils/tokenGenerator');

const agent = request.agent(app);

const token = tokenGenerator({username: "user", _id: new mongoose.Types.ObjectId().toString(), permissions: true });

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
    reviews: [ ]
};

const itineraryId2 = new mongoose.Types.ObjectId().toString();
const itinerary2 = {
    _id: itineraryId2,
    name: "name2",
    addressStarting: "Add",
    latS: 40.5,
    lngS: 50.2,
    description: "desc",
    difficulty: "Principiante",
    length: 12.5,
    reviews: [ ]
};

describe('POST /api/v2/itineraries', () => {

    describe('given incomplete or wrong parameters', () => {
        const reqBody = { 
            name: "name",
            addressStarting: "Add",
            latS: 40.5,
            lngS: 50.2,
            description: "desc",
            difficulty: "",
            length: 12.5
        };
        
        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.post("/api/v2/itineraries").set('x-access-token', token).send(reqBody);

            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const { statusCode, body } = await agent.post("/api/v2/itineraries").set('x-access-token', token).send(reqBody);

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' };
            expect(body).toEqual(response);
        });
    });

    describe('given new itinerary with name already existing', () => {
        const reqBody = { 
            name: "name",
            addressStarting: "Add",
            latS: 40.5,
            lngS: 50.2,
            description: "desc",
            difficulty: "Principiante",
            length: 12.5
        };                

        it('should return a 409 status code', async () =>{
            jest.spyOn(Itinerary, "findOne").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.post("/api/v2/itineraries").set('x-access-token', token).send(reqBody);
            
            expect(statusCode).toBe(409);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findOne").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.post("/api/v2/itineraries").set('x-access-token', token).send(reqBody);

            const response = { success: false, message: 'Creation itinerary failed. Itinerary already exists.' };
            expect(body).toEqual(response);
        });
    });

    describe('given new itinerary with valid data', () => {
        const reqBody = { 
            name: "name",
            addressStarting: "Add",
            latS: 40.5,
            lngS: 50.2,
            description: "desc",
            difficulty: "Principiante",
            length: 12.5
        };                

        it('should return a 201 status code', async () =>{
            jest.spyOn(Itinerary, "findOne").mockReturnValueOnce(null);
            jest.spyOn(Itinerary, "create").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.post("/api/v2/itineraries").set('x-access-token', token).send(reqBody);
            
            expect(statusCode).toBe(201);
        });

        it('should return the created itinerary', async () =>{
            jest.spyOn(Itinerary, "findOne").mockReturnValueOnce(null);
            jest.spyOn(Itinerary, "create").mockReturnValueOnce(itinerary1);
            const { statusCode, body } = await agent.post("/api/v2/itineraries").set('x-access-token', token).send(reqBody);

            const response = {
                success: true,
                message: 'New itinerary added!',
                itinerary: {
                    _id: itinerary1._id,
                    name: itinerary1.name,
                    addressStarting: itinerary1.addressStarting,
                    latS: itinerary1.latS, 
                    lngS: itinerary1.lngS, 
                    description: itinerary1.description,
                    length: itinerary1.length,
                    difficulty: itinerary1.difficulty,
                    self: "/api/v2/itineraries/" + itinerary1._id
                }
            };
            expect(body).toEqual(response);
        });
    });

});

describe('GET /api/v2/itineraries', () => {

    describe('given itineraries stored in db', () => {              

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "find").mockReturnValueOnce([
                itinerary1,
                itinerary2
            ]);
            const { statusCode, body } = await agent.get("/api/v2/itineraries").send();
            
            expect(statusCode).toBe(200);
        });

        it('should return the list of itineraries', async () =>{
            jest.spyOn(Itinerary, "find").mockReturnValueOnce([
                itinerary1,
                itinerary2
            ]);
            const { statusCode, body } = await agent.get("/api/v2/itineraries").send();

            const response = [
                {
                    _id: itinerary1._id,
                    name: itinerary1.name,
                    addressStarting: itinerary1.addressStarting,
                    latS: itinerary1.latS, 
                    lngS: itinerary1.lngS, 
                    description: itinerary1.description,
                    length: itinerary1.length,
                    difficulty: itinerary1.difficulty,
                    self: "/api/v2/itineraries/" + itinerary1._id
                },
                {
                    _id: itinerary2._id,
                    name: itinerary2.name,
                    addressStarting: itinerary2.addressStarting,
                    latS: itinerary2.latS, 
                    lngS: itinerary2.lngS, 
                    description: itinerary2.description,
                    length: itinerary2.length,
                    difficulty: itinerary2.difficulty,
                    self: "/api/v2/itineraries/" + itinerary2._id
                }
            ];
            expect(body).toEqual(response);
        });
    });
    
});

describe('GET /api/v2/itineraries/name', () => {

    describe('given itineraries stored in db', () => {              

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "find").mockReturnValueOnce([
                {name: itinerary1.name},
                {name: itinerary2.name}
            ]);
            const { statusCode, body } = await agent.get("/api/v2/itineraries/name").send();
            
            expect(statusCode).toBe(200);
        });

        it('should return the list of itinerary names', async () =>{
            jest.spyOn(Itinerary, "find").mockReturnValueOnce([
                { _id: itinerary1._id, name: itinerary1.name },
                { _id: itinerary2._id, name: itinerary2.name }
            ]);
            const { statusCode, body } = await agent.get("/api/v2/itineraries/name").send();

            const response = [
                { _id: itinerary1._id, name: itinerary1.name },
                { _id: itinerary2._id, name: itinerary2.name }
            ];
            expect(body).toEqual(response);
        });
    });
    
});

describe('DELETE /api/v2/itineraries/:id', () => {

    describe('given unexisting id', () => {              

        it('should return a 404 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(404);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(null);
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}`).set('x-access-token', token).send();

            const response = { success: false, message: 'Itinerary not found' };
            expect(body).toEqual(response);
        });
    });

    describe('given existing id', () => {              

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            let deleteMock = jest.spyOn(Itinerary, "deleteOne").mockImplementationOnce(() => Promise.resolve());
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}`).set('x-access-token', token).send();
            
            expect(statusCode).toBe(200);
            expect(deleteMock).toHaveBeenCalledWith({_id: itineraryId1});
        });

        it('should return an ok message', async () =>{
            jest.spyOn(Itinerary, "findById").mockReturnValueOnce(itinerary1);
            let deleteMock = jest.spyOn(Itinerary, "deleteOne").mockImplementationOnce(() => Promise.resolve());
            const { statusCode, body } = await agent.delete(`/api/v2/itineraries/${itineraryId1}`).set('x-access-token', token).send();

            const response = { success: true, message: 'Itinerary deleted!' };
            expect(body).toEqual(response);
            expect(deleteMock).toHaveBeenCalledWith({_id: itineraryId1});
        });
    });

});

describe('PUT /api/v2/itineraries/:id', () => {

    describe('given unexisting id', () => {              
        const reqBody = { 
            name: "name",
            addressStarting: "Add",
            latS: 40.5,
            lngS: 50.2,
            description: "desc",
            difficulty: "Principiante",
            length: 12.5
        };   

        it('should return a 404 status code', async () =>{
            jest.spyOn(Itinerary, "updateOne").mockReturnValueOnce({ modifiedCount: 0 });
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}`).set('x-access-token', token).send(reqBody);
            
            expect(statusCode).toBe(404);
        });

        it('should return an error message', async () =>{
            jest.spyOn(Itinerary, "updateOne").mockReturnValueOnce({ modifiedCount: 0 });
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}`).set('x-access-token', token).send(reqBody);

            const response = { success: false, message: 'Itinerary not found' };
            expect(body).toEqual(response);
        });
    });

    describe('given existing id', () => {              
        const reqBody = { 
            name: "name",
            addressStarting: "Add",
            latS: 40.5,
            lngS: 50.2,
            description: "desc",
            difficulty: "Principiante",
            length: 12.5
        };   

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "updateOne").mockReturnValueOnce({ modifiedCount: 1 });
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}`).set('x-access-token', token).send(reqBody);
            
            expect(statusCode).toBe(200);
        });

        it('should return an ok message', async () =>{
            jest.spyOn(Itinerary, "updateOne").mockReturnValueOnce({ modifiedCount: 1 });
            const { statusCode, body } = await agent.put(`/api/v2/itineraries/${itineraryId1}`).set('x-access-token', token).send(reqBody);

            const response = { success: true, message: 'Itinerary info updated!' };
            expect(body).toEqual(response);
        });
    });

});

describe('GET /api/v2/difficulty', () => {

    describe('given no difficulty as parameter', () => {        
        const difficulty = "";

        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/difficulty?difficulty=${difficulty}`).send();

            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/difficulty?difficulty=${difficulty}`).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' };
            expect(body).toEqual(response);
        });
    });

    describe('given a difficulty', () => {              
        const difficulty = 'Principiante';

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "find").mockReturnValueOnce([
                itinerary1,
                itinerary2
            ]);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/difficulty?difficulty=${difficulty}`).send();
            
            expect(statusCode).toBe(200);
        });

        it('should return the list of itineraries of that difficulty', async () =>{
            jest.spyOn(Itinerary, "find").mockReturnValueOnce([
                itinerary1,
                itinerary2
            ]);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/difficulty?difficulty=${difficulty}`).send();

            const response = [
                {
                    _id: itinerary1._id,
                    name: itinerary1.name,
                    addressStarting: itinerary1.addressStarting,
                    latS: itinerary1.latS, 
                    lngS: itinerary1.lngS, 
                    description: itinerary1.description,
                    length: itinerary1.length,
                    difficulty: itinerary1.difficulty,
                    self: "/api/v2/itineraries/" + itinerary1._id
                },
                {
                    _id: itinerary2._id,
                    name: itinerary2.name,
                    addressStarting: itinerary2.addressStarting,
                    latS: itinerary2.latS, 
                    lngS: itinerary2.lngS, 
                    description: itinerary2.description,
                    length: itinerary2.length,
                    difficulty: itinerary2.difficulty,
                    self: "/api/v2/itineraries/" + itinerary2._id
                }
            ];
            expect(body).toEqual(response);
        });
    });
    
});

describe('GET /api/v2/zone', () => {

    describe('given bad latitude or longitude as parameter', () => {        
        const latitude = "text";
        const longitude = 42.5;

        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/zone?latitude=${latitude}&longitude=${longitude}`).send();

            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/zone?latitude=${latitude}&longitude=${longitude}`).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' };
            expect(body).toEqual(response);
        });
    });

    describe('given latitude and longitude', () => {              
        const latitude = 50.2;
        const longitude = 42.5;

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "find").mockReturnValueOnce([
                itinerary1,
                itinerary2
            ]);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/zone?latitude=${latitude}&longitude=${longitude}`).send();
            
            expect(statusCode).toBe(200);
        });

        it('should return the list of itineraries of that difficulty', async () =>{
            jest.spyOn(Itinerary, "find").mockReturnValueOnce([
                itinerary1,
                itinerary2
            ]);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/zone?latitude=${latitude}&longitude=${longitude}`).send();

            const response = [
                {
                    _id: itinerary1._id,
                    name: itinerary1.name,
                    addressStarting: itinerary1.addressStarting,
                    latS: itinerary1.latS, 
                    lngS: itinerary1.lngS, 
                    description: itinerary1.description,
                    length: itinerary1.length,
                    difficulty: itinerary1.difficulty,
                    self: "/api/v2/itineraries/" + itinerary1._id
                },
                {
                    _id: itinerary2._id,
                    name: itinerary2.name,
                    addressStarting: itinerary2.addressStarting,
                    latS: itinerary2.latS, 
                    lngS: itinerary2.lngS, 
                    description: itinerary2.description,
                    length: itinerary2.length,
                    difficulty: itinerary2.difficulty,
                    self: "/api/v2/itineraries/" + itinerary2._id
                }
            ];
            expect(body).toEqual(response);
        });
    });
    
});

describe('GET /api/v2/length', () => {

    describe('given bad minLength or maxLength as parameter', () => {        
        const minLength = "text";
        const maxLength = 42.5;

        it('should return a 400 status code', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/length?minLength=${minLength}&maxLength=${maxLength}`).send();

            expect(statusCode).toBe(400);
        });

        it('should return an error message', async () =>{
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/length?minLength=${minLength}&maxLength=${maxLength}`).send();

            const response = { success: false, message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' };
            expect(body).toEqual(response);
        });
    });

    describe('given latitude and longitude', () => {              
        const minLength = 10;
        const maxLength = 42.5;

        it('should return a 200 status code', async () =>{
            jest.spyOn(Itinerary, "find").mockReturnValueOnce([
                itinerary1,
                itinerary2
            ]);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/length?minLength=${minLength}&maxLength=${maxLength}`).send();
            
            expect(statusCode).toBe(200);
        });

        it('should return the list of itineraries of that difficulty', async () =>{
            jest.spyOn(Itinerary, "find").mockReturnValueOnce([
                itinerary1,
                itinerary2
            ]);
            const { statusCode, body } = await agent.get(`/api/v2/itineraries/length?minLength=${minLength}&maxLength=${maxLength}`).send();

            const response = [
                {
                    _id: itinerary1._id,
                    name: itinerary1.name,
                    addressStarting: itinerary1.addressStarting,
                    latS: itinerary1.latS, 
                    lngS: itinerary1.lngS, 
                    description: itinerary1.description,
                    length: itinerary1.length,
                    difficulty: itinerary1.difficulty,
                    self: "/api/v2/itineraries/" + itinerary1._id
                },
                {
                    _id: itinerary2._id,
                    name: itinerary2.name,
                    addressStarting: itinerary2.addressStarting,
                    latS: itinerary2.latS, 
                    lngS: itinerary2.lngS, 
                    description: itinerary2.description,
                    length: itinerary2.length,
                    difficulty: itinerary2.difficulty,
                    self: "/api/v2/itineraries/" + itinerary2._id
                }
            ];
            expect(body).toEqual(response);
        });
    });
    
});