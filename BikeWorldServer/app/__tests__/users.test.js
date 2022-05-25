const app = require('../app');
const request = require('supertest');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const tokenGenerator = require('../utils/tokenGenerator');

const agent = request.agent(app);

const userId = new mongoose.Types.ObjectId().toString();
const wrongUserId = new mongoose.Types.ObjectId().toString();

//Test login
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
        it("should return a 201 status code", async () => {
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

    describe("given incomplete data", () => {
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

//Test get user
describe('GET /api/v2/users/:id', () => {

    describe("given the id valid", () => {
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
            // create a valid token
            var _token = jwt.sign({
                    user_id: userId,
                    permissions: false,
                    username: "test_username"
                },
                process.env.TOKEN_SECRET,
                {expiresIn: 86400}
            )
                
            const findUserMock = jest.spyOn(User, "findById").mockReturnValueOnce(userPayload);
            const { statusCode, body } = await agent.get("/api/v2/users/"+userId).set('x-access-token',_token)
                .send();          
    
            expect(statusCode).toBe(200);     
        });

        it("should return the user info", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const sessionResult = {
                target: "principiante",
                permissions: false,
                email: "test_username@domain.com",
                username: "test_username",
                id: userId,
                self: "/api/v2/users/" + userId
            };
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };

            // create a valid token
            var _token = jwt.sign({
                    user_id: userId,
                    permissions: false,
                    username: "test_username"
                },
                process.env.TOKEN_SECRET,
                {expiresIn: 86400}
            )

            const findUserMock = jest.spyOn(User, "findById").mockReturnValueOnce(userPayload);
    
            const { statusCode, body } = await agent.get("/api/v2/users/"+userId).set('x-access-token',_token)
                .send();  
            
            expect(body).toEqual(sessionResult);          
        });
    });
    
    describe("request without token", () => {
        it("should return a 401 status code", async () => {
            const { statusCode, body } = await agent.get("/api/v2/users/" + userId)
                .send();    
            expect(statusCode).toBe(401);     
        });

        it("should return the error message", async () => {
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
            const { statusCode, body } = await agent.get("/api/v2/users/"+userId)
                .send();
            
            expect(body).toEqual(sessionResult);          
        });
    });

    describe("request without valid token", () => {
        it("should return a 403 status code", async () => {
            const { statusCode, body } = await agent.get("/api/v2/users/"+userId).set("x-access-token", "noToken")
                .send();    
            expect(statusCode).toBe(403);     
        });

        it("should return the error message", async () => {
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
            const { statusCode, body } = await agent.get("/api/v2/users/"+userId).set("x-access-token", "noToken")
                .send();    
            
            expect(body).toEqual(sessionResult);          
        });
    });

    describe("given not correct id", () => {
        it("should return a 403 status code", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };
            // create a valid token
            var _token = jwt.sign({
                    user_id: userId,
                    permissions: false,
                    username: "test_username"
                },
                process.env.TOKEN_SECRET,
                {expiresIn: 86400}
            )

            const findUserMock = jest.spyOn(User, "findById").mockReturnValueOnce(userPayload);
            const wrongUserId = new mongoose.Types.ObjectId().toString();            
            const { statusCode, body } = await agent.get("/api/v2/users/"+wrongUserId).set('x-access-token',_token)
                .send();          
    
            expect(statusCode).toBe(403);     
        });

        it("should return an error message", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const sessionResult = {
                success: false,
                message: 'Unauthorized. You can access only your informations.'
            };
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_username@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "principiante"
            };

            // create a valid token
            var _token = jwt.sign({
                    user_id: userId,
                    permissions: false,
                    username: "test_username"
                },
                process.env.TOKEN_SECRET,
                {expiresIn: 86400}
            )

            const findUserMock = jest.spyOn(User, "findById").mockReturnValueOnce(userPayload);
            const wrongUserId = new mongoose.Types.ObjectId().toString();
            const { statusCode, body } = await agent.get("/api/v2/users/"+wrongUserId).set('x-access-token',_token)
                .send();  
            
            expect(body).toEqual(sessionResult);          
        });
    });
});


//Test update user
describe('PUT /api/v2/users/:id', () => {

    describe("given id, password, email and target valid", () => {
        it("should return a 200 status code", async () => {
            const hash = await bcrypt.hash("hashed_psw", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_update@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "esperto"
            };
            // create a valid token
            var _token = jwt.sign({
                    user_id: userId,
                    permissions: false,
                    username: "test_username"
                },
                process.env.TOKEN_SECRET,
                {expiresIn: 86400}
            )
                
            const updateMock = jest.spyOn(User, "updateOne").mockReturnValueOnce(null);
            const findUserMock = jest.spyOn(User, "findById").mockReturnValueOnce(userPayload);
            const { statusCode, body } = await agent.put("/api/v2/users/"+userId).set('x-access-token',_token)
                .send({ password: "hashed_psw", email: "test_update@domain.com", target: "esperto"});          
    
            expect(statusCode).toBe(200);     
        });
        
        it("should return a valid token and user info", async () => {
            const hash = await bcrypt.hash("hashed_psw", 10);
            const userPayload = {
                _id: userId,
                username: "test_username",
                email: "test_update@domain.com",
                psw_hash: hash,
                permissions: false,
                target: "esperto"
            };

            const sessionResult = {
                success: true,
                message: 'Information updated!',
                token: expect.any(String),
                permissions: false,
                username: "test_username",
                id: userId,
                self: "api/v2/users/" + userId
            };

            // create a valid token
            var _token = jwt.sign({
                    user_id: userId,
                    permissions: false,
                    username: "test_username"
                },
                process.env.TOKEN_SECRET,
                {expiresIn: 86400}
            )
                
            const updateMock = jest.spyOn(User, "updateOne").mockReturnValueOnce(null);
            const findUserMock = jest.spyOn(User, "findById").mockReturnValueOnce(userPayload);
            const { statusCode, body } = await agent.put("/api/v2/users/"+userId).set('x-access-token',_token)
                .send({ password: "hashed_psw", email: "test_update@domain.com", target: "esperto"});          
    
            expect(body).toEqual(sessionResult);    
        });
    });
    
    describe("request without token", () => {
        it("should return a 401 status code", async () => {
            const { statusCode, body } = await agent.put("/api/v2/users/"+userId)
                .send();    
            expect(statusCode).toBe(401);     
        });

        it("should return the error message", async () => {
            const sessionResult = {
                success: false,
                message: 'No token provided.'
            };
            const { statusCode, body } = await agent.put("/api/v2/users/"+userId)
                .send();
            
            expect(body).toEqual(sessionResult);          
        });
    });

    describe("request without valid token", () => {
        it("should return a 403 status code", async () => {
            const { statusCode, body } = await agent.put("/api/v2/users/"+userId).set("x-access-token", "noToken")
                .send();    
            expect(statusCode).toBe(403);     
        });

        it("should return the error message", async () => {
            const sessionResult = {
                success: false,
                message: 'Failed to authenticate token.'
            };
            const { statusCode, body } = await agent.put("/api/v2/users/"+userId).set("x-access-token", "noToken")
                .send();    
            
            expect(body).toEqual(sessionResult);          
        });
    });
    
    describe("given not correct id", () => {        
        it("should return a 403 status code", async () => {
            // create a valid token
            var _token = jwt.sign({
                    user_id: userId,
                    permissions: false,
                    username: "test_username"
                },
                process.env.TOKEN_SECRET,
                {expiresIn: 86400}
            )
     
            const { statusCode, body } = await agent.put("/api/v2/users/"+wrongUserId).set('x-access-token',_token)
                .send({ password: "hashed_psw", email: "test_update@domain.com", target: "esperto"});          
    
            expect(statusCode).toBe(403);     
        });
        
        it("should return an error message", async () => {
            const sessionResult = {
                success: false,
                message: 'Unauthorized. You can access only your informations.'
            };

            // create a valid token
            var _token = jwt.sign({
                    user_id: userId,
                    permissions: false,
                    username: "test_username"
                },
                process.env.TOKEN_SECRET,
                {expiresIn: 86400}
            )

            const { statusCode, body } = await agent.put("/api/v2/users/"+wrongUserId).set('x-access-token',_token)
                .send({ password: "hashed_psw", email: "test_update@domain.com", target: "esperto"});  
            
            expect(body).toEqual(sessionResult);          
        });
    });
    
    
    describe("given incomplete data", () => {
        it("should return a 400 status code", async () => {
            // create a valid token
            var _token = jwt.sign({
                    user_id: userId,
                    permissions: false,
                    username: "test_username"
                },
                process.env.TOKEN_SECRET,
                {expiresIn: 86400}
            )
       
            const { statusCode, body } = await agent.put("/api/v2/users/"+userId).set('x-access-token',_token)
                .send();          
    
            expect(statusCode).toBe(400);     
        });

        it("should return an error message", async () => {
            const hash = await bcrypt.hash("test_password", 10);
            const sessionResult = {
                success: false,
                message: 'Bad Request. Check docs for required parameters. /api/v2/api-docs'
            };

            // create a valid token
            var _token = jwt.sign({
                    user_id: userId,
                    permissions: false,
                    username: "test_username"
                },
                process.env.TOKEN_SECRET,
                {expiresIn: 86400}
            )

            const { statusCode, body } = await agent.put("/api/v2/users/"+userId).set('x-access-token',_token)
                .send();  
            
            expect(body).toEqual(sessionResult);          
        });
    });
});
