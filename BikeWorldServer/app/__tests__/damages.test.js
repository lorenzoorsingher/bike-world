const app = require('../app');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const Damage = require('../models/damage');
const Bike = require('../models/bike');
const jwt = require("jsonwebtoken");
const tokenGenerator = require('../utils/tokenGenerator');

const agent = request.agent(app);

const userId = new mongoose.Types.ObjectId().toString();
var _token = jwt.sign({ user_id: userId, permissions: false, username: "test_username" }, process.env.TOKEN_SECRET,{expiresIn: 86400} )
const bikeId1 = new mongoose.Types.ObjectId().toString();
const bike1 ={
    _id: bikeId1,
    bikeCode: "bike1",
    model: "model",
    type: "type",
    rentalPointName: "Rental",
    state: true
};
const damageId = new mongoose.Types.ObjectId().toString();
const damageId1 = new mongoose.Types.ObjectId().toString();
const damage1 = {
    _id: damageId1, 
    bikeCode: "bike1", 
    description: "Che danno"
}
const damageId2 = new mongoose.Types.ObjectId().toString();
const damage2 = {
    _id: damageId2, 
    bikeCode: "bike2", 
    description: "Che danno"
}

//Test add new damage
describe('POST /api/v2/damages', () => {
    describe("given the bikeCode and description valid", () => {
        it("should return a 201 status code", async () => {     
            jest.spyOn(Bike, "findOne").mockReturnValueOnce(bike1);              
            jest.spyOn(Damage, "create").mockReturnValueOnce(damage1);    
            const { statusCode, body } = await agent.post("/api/v2/damages").set('x-access-token', _token)
                .send({ code: "bike1", description: "Che danno"});
    
            expect(statusCode).toBe(201);     
        });
        
        it("should return the new rental point created info", async () => {
            const sessionResult = {
                success: true,
                message: 'Report ricevuto correttamente!'
            }
            jest.spyOn(Bike, "findOne").mockReturnValueOnce(bike1); 
            jest.spyOn(Damage, "create").mockReturnValueOnce(damage1);    
            const { statusCode, body } = await agent.post("/api/v2/damages").set('x-access-token', _token)
                .send({ code: "bike1", description: "Che danno"});

            expect(body).toEqual(sessionResult);             
        });
    });

    describe("given invalid bikeCode", () => {
        it("should return a 404 status code", async () => {     
            jest.spyOn(Bike, "findOne").mockReturnValueOnce(null);      
            const { statusCode, body } = await agent.post("/api/v2/damages").set('x-access-token', _token)
                .send({ code: "bike1", description: "Che danno"});
    
            expect(statusCode).toBe(404);     
        });
        
        it("should return the new rental point created info", async () => {
            const sessionResult = {
                success: false,
                message: `Bike with code: bike1 not found.`
            }
            jest.spyOn(Bike, "findOne").mockReturnValueOnce(null);      
            const { statusCode, body } = await agent.post("/api/v2/damages").set('x-access-token', _token)
                .send({ code: "bike1", description: "Che danno"});

            expect(body).toEqual(sessionResult);             
        });
    });
    
    describe("given incomplete data", () => {
        it("should return a 400 status code", async () => {
            const { statusCode, body } = await agent.post("/api/v2/damages").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(400);     
        });
        
        it("should return an error message", async () => {

            const sessionResult = {
                success: false,
                message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs' 
            };
            const { statusCode, body } = await agent.post("/api/v2/damages").set('x-access-token', _token)
                .send();
    
            expect(body).toEqual(sessionResult);             
        });
    });

});


//Test get damages
describe('GET /api/v2/damages', () => {
    describe("return the list of all damages", () => {
        it("should return a 200 status code", async () => {            
            const findMock = jest.spyOn(Damage, "find").mockReturnValueOnce([damage1, damage2]);
    
            const { statusCode, body } = await agent.get("/api/v2/damages").set('x-access-token', _token)
                .send();
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return the list of damages info", async () => {
            const sessionResult = [
                {
                    _id: damageId1, 
                    bikeCode: "bike1", 
                    description: "Che danno"
                },{
                    _id: damageId2, 
                    bikeCode: "bike2", 
                    description: "Che danno"
                }
            ]
            const findMock = jest.spyOn(Damage, "find").mockReturnValueOnce([damage1, damage2]);
    
            const { statusCode, body } = await agent.get("/api/v2/damages").set('x-access-token', _token)
                .send();
            expect(body).toEqual(sessionResult);             
        });
    });   
});
