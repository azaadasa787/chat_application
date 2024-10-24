const express = require('express');
const Message = require('../models/message');

const router = express.Router();

// Send message
router.post('/', async (req, res) => {
    try{
        const { groupId, userId, content } = req.body;
        // Input validation
        if (!groupId || !userId || !content) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const message = new Message({ groupId, userId, content });
        await message.save();
        res.status(201).json({
            message: 'Messages Sent Successfully',
            id : message.id
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
  
});

// Like message
router.post('/:id/like', async (req, res) => {
    try{
        const { userId } = req.body;
        const message = await Message.findById(req.params.id);
        if (!message.likes.includes(userId)) {
            message.likes.push(userId);
            await message.save();
        }
        res.status(201).json({
            message: 'Messages Sent Successfully',
            id : message.id
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get messages for a group
router.get('/group/:groupId', async (req, res) => {
    try{
        const messages = await Message.find({ groupId: req.params.groupId }).populate({
            path: 'userId',
            select: '-password -__v' 
        })
        .lean();
        if (!messages || messages.length == 0) {
            return res.status(404).json({ message: 'No Groups Available' });
        }
        res.json(messages);

    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
   
});

module.exports=router;