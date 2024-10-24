const express = require('express');
const User = require('../models/user');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const router = express.Router();

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.sendStatus(401); 

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Middleware to verify admin
const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden' });
    }
    next();
};

// Admin can only access to add users
router.post('/', authenticateToken, adminMiddleware, async (req, res) => {
    try{
        const { username, password, role } = req.body;
        console.log(req.body)
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, role });
        await user.save();
        res.status(201).json({
            message: 'User created Successfully',
            id : user.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
   
});

// Admin can only access to edit users
router.put('/:id',  authenticateToken, adminMiddleware, async (req, res) => {
    try {
        const updatedUser = await User.findOneAndUpdate(
            { _id: req.params.id },          
            { $set: req.body },               
            { new: true, runValidators: true }
        );       

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(201).json({
            message: 'User Updated Successfully',
            id : updatedUser?.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Get all users
router.get('/', async (req, res) => {
    try{
        const users = await User.find().lean();
        if (!users || users.length == 0) {
            return res.status(404).json({ message: 'No Users Available' });
        }
        users.forEach(user => {
            delete user.password;
            delete user.__v;
        });
    
        console.log(users);
        res.json({ message: 'User fetched Successfully',
            users : users
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
   
});

module.exports=router;