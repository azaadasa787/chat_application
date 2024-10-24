const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const messageRouter = require('../routes/messages'); 
const Message = require('../models/message');
const User = require('../models/user');

app.use(express.json());
app.use('/api/messages', messageRouter);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterEach(async () => {
  await Message.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/messages', () => {
  it('should send a message successfully', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send({
        groupId: '60c72b2f4f1a2c001c8e4eec',
        userId: '60c72b2f4f1a2c001c8e4eeb',
        content: 'Hello, world!',
      });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Messages Sent Successfully');
    expect(response.body.id).toBeDefined();
  });

  it('should return a server error when missing required fields', async () => {
    const response = await request(app)
      .post('/api/messages')
      .send({
        groupId: '60c72b2f4f1a2c001c8e4eec',
        content: 'Hello, world!',
      });

    expect(response.status).toBe(400);
  });
});

describe('POST /api/messages/:id/like', () => {
  it('should like a message successfully', async () => {
    const message = new Message({
      groupId: '60c72b2f4f1a2c001c8e4eec',
      userId: '60c72b2f4f1a2c001c8e4eeb',
      content: 'Hello, world!',
    });
    await message.save();

    const response = await request(app)
      .post(`/api/messages/${message._id}/like`)
      .send({ userId: '60c72b2f4f1a2c001c8e4eeb' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Messages Sent Successfully');
  });

  it('should not like a message twice by the same user', async () => {
    const message = new Message({
      groupId: '60c72b2f4f1a2c001c8e4eec',
      userId: '60c72b2f4f1a2c001c8e4eeb',
      content: 'Hello, world!',
      likes: [],
    });
    await message.save();

    await request(app)
      .post(`/api/messages/${message._id}/like`)
      .send({ userId: '60c72b2f4f1a2c001c8e4eeb' });

    const response = await request(app)
      .post(`/api/messages/${message._id}/like`)
      .send({ userId: '60c72b2f4f1a2c001c8e4eeb' });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('Messages Sent Successfully');
  });
});

describe('GET /api/messages/group/:groupId', () => {
  it('should get messages for a group', async () => {
    const message = new Message({
      groupId: '60c72b2f4f1a2c001c8e4eec',
      userId: '60c72b2f4f1a2c001c8e4eeb',
      content: 'Hello, world!',
    });
    await message.save();

    const response = await request(app).get('/api/messages/group/60c72b2f4f1a2c001c8e4eec');

    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].content).toBe('Hello, world!');
  });

  it('should return a 404 if no messages are found', async () => {
    const response = await request(app).get('/api/messages/group/60c72b2f4f1a2c001c8e4eec');

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No Groups Available');
  });
});
