const app = require('../app');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');
const tokenGenerator = require('../utils/tokenGenerator');

const agent = request.agent(app);

const userId = new mongoose.Types.ObjectId().toString();

describe('POST /api/v1/users/login', () => {

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
            const sessionResult = {
                success: true,
                message: 'Token sucessfully created',
                token: tokenGenerator(userPayload),
                permissions: false,
                username: "test_username",
                id: userId,
                self: "/api/v1/users/" + userId
            };

            const loginMock = jest.spyOn(User, "findOne").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v1/users/login")
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
                self: "/api/v1/users/" + userId
            };

            const loginMock = jest.spyOn(User, "findOne").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v1/users/login")
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
            const sessionResult = {
                success: true,
                message: 'Token sucessfully created',
                token: tokenGenerator(userPayload),
                permissions: false,
                username: "test_username",
                id: userId,
                self: "/api/v1/users/" + userId
            };

            const loginMock = jest.spyOn(User, "findOne").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.post("/api/v1/users/login")
                .send({ username: "test_username", password: "wrong_password" });
    
            expect(statusCode).toBe(400);     
        });

        it("should return the user payload", async () => {
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
    
            const { statusCode, body } = await agent.post("/api/v1/users/login")
                .send({ username: "test_username", password: "wrong_password" });
            
            expect(body).toEqual(sessionResult);          
        });
    });

});