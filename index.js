const express = require('express');
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const messageRoutes = require('./routes/messages')

const app = express();
app.use(express.json());
dotenv.config()

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/messages', messageRoutes);

module.exports = app;


app.listen(3000, ()=>{
    console.log(`server listing on the port:3000`);
})