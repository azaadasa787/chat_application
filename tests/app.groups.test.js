const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');

const app = express()
const Group = require('../models/group');
const User = require('../models/user');
const groupsRouter = require('../routes/groups'); 


app.use(express.json());
app.use('/api/groups', groupsRouter);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Groups API', () => {
    let userId;

    beforeAll(async () => {
        // Create a user for testing
        const user = new User({
            username: 'testuser',
            password: 'testpassword',
        });
        await user.save();
        userId = user._id; 
    });

    afterEach(async () => {
        await Group.deleteMany({});
    });

    describe('POST /api/groups', () => {
        it('should create a group successfully', async () => {
            const response = await request(app)
                .post('/api/groups')
                .send({
                    name: 'Test Group',
                    members: [userId]
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Group Created Successfully');
            expect(response.body.id).toBeDefined();
        });

        it('should return a 400 error when members is not a non-empty array', async () => {
            const response = await request(app)
                .post('/api/groups')
                .send({ name: 'Invalid Group', members: [] });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Members should be a non-empty array.');
        });
    });

    describe('GET /api/groups', () => {
        beforeEach(async () => {
            const group = new Group({
                name: 'Test Group',
                members: [userId],
            });
            await group.save();
        });

        it('should get all groups successfully', async () => {
            const response = await request(app).get('/api/groups');

            expect(response.status).toBe(200);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0].name).toBe('Test Group');
        });

        it('should return a 404 error if no groups are found', async () => {
            await Group.deleteMany({});

            const response = await request(app).get('/api/groups');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('No Groups Available');
        });
    });

    describe('GET /api/groups/:id', () => {
        let groupId;

        beforeEach(async () => {
            const group = new Group({
                name: 'Test Group',
                members: [userId],
            });
            await group.save();
            groupId = group._id;
        });

        it('should get a group by ID successfully', async () => {
            const response = await request(app).get(`/api/groups/${groupId}`);

            expect(response.status).toBe(200);
            expect(response.body.name).toBe('Test Group');
        });

        it('should return a 400 error for invalid ID', async () => {
            const response = await request(app).get('/api/groups/invalidId');
            expect(response.status).toBe(400); 
            expect(response.body.message).toBe('Invalid ID format'); 
        });
    });

    describe('PUT /api/groups/:id', () => {
        let groupId;

        beforeEach(async () => {
            const group = new Group({
                name: 'Test Group',
                members: [userId],
            });
            await group.save();
            groupId = group._id; 
        });

        it('should update a group by ID successfully', async () => {
            const response = await request(app)
                .put(`/api/groups/${groupId}`)
                .send({ name: 'Updated Test Group' });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Group Updated Successfully');
            expect(response.body.id).toBe(groupId.toString());
        });

        it('should return a 500 error if group not found', async () => {
            const response = await request(app)
                .put('/api/groups/invalidId')
                .send({ name: 'Updated Group' });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Server error');
        });
    });

    describe('DELETE /api/groups/:id', () => {
        let groupId;

        beforeEach(async () => {
            const group = new Group({
                name: 'Test Group',
                members: [userId],
            });
            await group.save();
            groupId = group._id; 
        });

        it('should delete a group by ID successfully', async () => {
            const response = await request(app).delete(`/api/groups/${groupId}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Group Deleted Successfully');
        });

        it('should return a 400 error if group not found', async () => {
            const response = await request(app).delete('/api/groups/invalidId');

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Invalid ID format');
        });
    });
});
