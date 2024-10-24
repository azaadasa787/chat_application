const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../index')

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Auth APIs', () => {
    it('should register a new user', async () => {
        const response = await request(app).post('/api/auth/register').send({ username: 'testuser1233', password: 'password123', role: 'user' });
        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('User created');
    });

    it('should login the user', async () => {
        const response = await request(app).post('/api/auth/login').send({ username: 'testuser1233', password: 'password123' });
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('token');
    });
});
