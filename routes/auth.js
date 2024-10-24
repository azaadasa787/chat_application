const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

router.post('/register', async (req, res) => {
    try{
        const { username, password, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, password: hashedPassword, role });
        await user.save();
        res.status(201).json({ message: 'User created' });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
  
});

router.post('/login', async (req, res) => {
    try{
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.json({ 
            message: 'login successfully',
            username : username,
            token : token
         });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
    
});

module.exports=router;