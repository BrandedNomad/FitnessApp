//import modules
const express = require('express');

//import models
const User = require('../db/models/user_model');
const TestResults = require("../db/models/test_results_model");

//import middleware
const auth = require('../middleware/auth');


//create Router
const router = express.Router();


//Create and Save new fitness test result
router.post('/tests', auth, async (req,res)=>{
    try{
        const testResults = await new TestResults({
            ...req.body,
            owner:req.user._id
        });

        await testResults.save();
        res.status(201).send(testResults)
    }catch(error){
        res.status(400).send(error)
    }
});

//List All Test results
router.get('/tests', auth, async (req,res)=>{

    const match = {};
    const sort = {};

    if(req.query.date){
        match.createdAt = req.query.date
    }

    if(req.query.test){
        const parts = req.query.test.split(':');
        match[parts[0]] = {$gte:parseInt(parts[1])}
    }

    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1:1;
    }



    try{
        await req.user.populate({
            path:'testResults',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        if(!req.user.testResults){
            res.status(404).send({error:"No results found"})
        }else{
            res.status(200).send(req.user.testResults);
        }

    }catch(error){
        res.status(500).send(error)
    }
});

//Get a single test result
router.get('/testsOne/:date', auth, async (req,res)=>{

    try{

        const testResults = await TestResults.findOne({date:req.params.date, owner:req.user._id});
        if(!testResults){
            res.status(404).send({error:"No results found for that date!"})
        }else{
            res.status(200).send(testResults);
        }

    }catch(error){

    }
});

//Update test results
router.patch('/tests/:date',auth, async (req,res)=>{
    try{
        const testResults = await TestResults.findOneAndUpdate({date:req.params.date,owner:req.user._id},req.body,{new:true});
        if(!testResults){
            res.status(404).send({error:"No tests found for that date"})
        }else{
            res.status(200).send(testResults)
        }


    }catch(error){
        res.status(500).send(error)
    }
});

//delete a test result
router.delete('/tests/:date', auth, async (req,res)=>{
    try{
        const testResults = await TestResults.findOneAndDelete({date:req.params.date,owner:req.user._id});
        if(!testResults){
            res.status(404).send({error:"No results to delete"})
        }else{
            res.status(200).send(testResults);
        }
    }catch(error){
        res.status(500).send(error)
    }
});


//Export module
module.exports = router;
