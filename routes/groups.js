const express = require('express');
const Group = require('../models/group');
const mongoose = require('mongoose');


const router = express.Router();

// Create group
router.post('/', async (req, res) => {
    try{
        const { name, members } = req.body;
        // Validate that 'members' is an array
        if (!Array.isArray(members) || members.length === 0) {
            return res.status(400).json({ message: 'Members should be a non-empty array.' });
        }
        const group = new Group({ name, members });
        await group.save();
        res.status(201).json({
            message: 'Group Created Successfully',
            id : group.id
        });
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
// Get all groups
router.get('/', async (req, res) => {
    try{
        const groups = await Group.find()
        .populate({
            path: 'members',
            select: '-password -__v' 
        })
        .lean();
        if (!groups || groups.length == 0) {
            return res.status(404).json({ message: 'No Groups Available' });
        }
        res.json(groups);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
   
});

// Get all groups
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    
    // Check if the ID is a valid ObjectId
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    try{
        const groups = await Group.findOne({_id: req.params.id}).populate({
            path: 'members',
            select: '-password -__v' 
        })
        .lean();
        if (!groups) {
            return res.status(404).json({ message: 'Group not found with given id' });
        }
        res.json(groups);
    }catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
   
});

// Update a group by ID
router.put('/:id', async (req, res) => {
    try {
        const updatedGroup = await Group.findOneAndUpdate(
            { _id: req.params.id },          
            { $set: req.body },              
            { new: true, runValidators: true } 
        ).populate('members');                 

        if (!updatedGroup) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.status(201).json({
            message: 'Group Updated Successfully',
            id : updatedGroup.id
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});




// Delete group
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    // Check if the ID is a valid ObjectId
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    try{
        let groups = await Group.findByIdAndDelete(req.params.id);
        if (!groups) {
            return res.status(404).json({ message: 'Group not found' });
        }
        res.json({ message: 'Group Deleted Successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});



module.exports=router;