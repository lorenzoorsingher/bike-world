const app = require('../app');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');
const tokenGenerator = require('../utils/tokenGenerator');

const agent = request.agent(app);

const userId = new mongoose.Types.ObjectId().toString();

describe('POST /api/v2/users/login', () => {

    describe("given the username and password are valid", () => {
        it("should return a 200 status code", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };

            const loginMock = jest.spyOn(User, "findOne").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v2/users/login")
                .send({ username: "test_username", password: "test_password" });
    
            expect(statusCode).toBe(200);     
        });

        it("should return a valid token and user info", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };
            const sessionResult = {
                success: true,
                message: 'Token sucessfully created',
                token: expect.any(String),
                permissions: false,
                username: "test_username",
                id: userId,
                self: "/api/v2/users/" + userId
            };

            const loginMock = jest.spyOn(User, "findOne").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v2/users/login")
                .send({ username: "test_username", password: "test_password" });
            
            expect(body).toEqual(sessionResult);          
        });
    });

    describe("given the username and password are wrong", () => {
        it("should return a 400 status code", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };

            const loginMock = jest.spyOn(User, "findOne").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v2/users/login")
                .send({ username: "test_username", password: "wrong_password" });
    
            expect(statusCode).toBe(400);     
        });

        it("should return the error message", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };
            const sessionResult = {
                success: false,
                message: 'Authentication failed. Wrong username or password.'
            };

            const loginMock = jest.spyOn(User, "findOne").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v2/users/login")
                .send({ username: "test_username", password: "wrong_password" });
            
            expect(body).toEqual(sessionResult);          
        });
    });

});

//Test signup
describe('POST /api/v2/users/signUp', () => {

    describe("given the username, password, email and target valid", () => {
        it("should return a 200 status code", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };

            const findUserMock = jest.spyOn(User, "findOne").mockReturnValueOnce(null);
            const signUpMock = jest.spyOn(User, "create").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v2/users/signUp")
                .send({ username: "test_username", password: "test_password", target: "principiante", email: "test_username@domain.com" });          
    
            expect(statusCode).toBe(201);     
        });

        it("should return a valid token and user info", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };
            const sessionResult = {
                success: true,
                message: 'Signup completed!',
                token: expect.any(String),
                permissions: false,
                username: "test_username",
                id: userId,
                self: "/api/v2/users/" + userId
            };

            const findUserMock = jest.spyOn(User, "findOne").mockReturnValueOnce(null);
            const signUpMock = jest.spyOn(User, "create").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v2/users/signUp")
                .send({ username: "test_username", password: "test_password", target: "principiante", email: "test_username@domain.com" });  
            
            expect(body).toEqual(sessionResult);          
        });
    });

    describe("given the username already existing", () => {
        it("should return a 409 status code", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };

            const findUserMock = jest.spyOn(User, "findOne").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v2/users/signUp")
                .send({ username: "test_username", password: "wrong_password", target: "principiante", email: "test_username@domain.com" });
    
            expect(statusCode).toBe(409);     
        });

        it("should return the error message", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };
            const sessionResult = {
                success: false,
                message: 'Signup failed. User already exists.'
            };

            const findUserMock = jest.spyOn(User, "findOne").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v2/users/signUp")
                .send({ username: "test_username", password: "wrong_password", target: "principiante", email: "test_username@domain.com" });
            
            expect(body).toEqual(sessionResult);          
        });
    });

    describe("given the incomplete data", () => {
        it("should return a 400 status code", async () => {
            const hash = await bcrypt.hash("test_password", 10);
        
            const { statusCode, body } = await agent.post("/api/v2/users/signUp")
                .send({ username: "test_username", password: "wrong_password" });
    
            expect(statusCode).toBe(400);     
        });

        it("should return the error message", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const sessionResult = {
                success: false,
                message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'
            };
    
            const { statusCode, body } = await agent.post("/api/v2/users/signUp")
                .send({ username: "test_username", password: "wrong_password", target: "principiante" });
            
            expect(body).toEqual(sessionResult);          
        });
    });

});