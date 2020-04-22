//modules
const express = require('express');
const auth = require('../middleware/auth');
const sharp = require('sharp');
const multer = require('multer');
const {sendWelcomeEmail, sendCancellationEmail} = require('../email/accounts');

//models
const User = require('../db/models/user_model');

//middleware

//Creating router
const router = express.Router();


//Route handlers

//Creates a new user
//@param: an Object that contains user information
//@return: an Object with the new user info.
router.post('/users',async (req,res)=>{
    try{
        const user = await new User(req.body);
        sendWelcomeEmail(user.email,user.name);
        const token = await user.generateAuthToken();
        await user.save();
        res.status(201).send({user,token})
    }catch(error){
        res.status(400).send(error)
    }
});

//Login User
router.post('/users/login', async (req,res)=>{

    try{
        const user = await User.findByCredentials(req.body.email,req.body.password);
        const token = await user.generateAuthToken();
        res.status(200).send({user,token})
    }catch(error){
        res.status(500).send(error)
    }

});

//Logout User
router.post('/users/logout', auth, async (req,res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token;
        });
        await req.user.save();
        res.status(200).send("Logout successful")
    }catch(error){
        res.status(500).send(error)
    }
});

//Logs out of all session
router.post('/users/logoutAll', auth, async(req,res)=>{
    try{
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send("Successfully logged out of all sessions")
    }catch(error){
        res.status(500).send(error)
    }
});

//Gets User Profile
router.get('/users/me', auth, async (req,res)=>{
    try{
        res.status(200).send(req.user);
    }catch(error){
        res.status(500).send(error)
    }
});

//Lists All users
router.get('/users', async (req,res)=>{
    try{
        const users = await User.find({});
        if(!users){
            res.status(404).send("No more users!")
        }else{
            res.status(200).send(users)
        }
    }catch(error){
        res.status(500).send(error)
    }
});

//Update user information
router.patch('/users/me',auth, async (req,res)=>{

    //Checks if provided info are valid
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name","age","gender","email","password"];
    const isValidOperation =updates.every((update)=>{
        return allowedUpdates.includes(update)
    });

    if(!isValidOperation){
        return res.status(400).send({error:"Invalid operation"})
    }

    //Updates user info
    try{
        //updates user info
        updates.forEach((update)=>{
            req.user[update] = req.body[update]
        });

        //saves changes to the database
        await req.user.save();

        res.status(200).send(req.user);
    }catch(error){
        res.status(500).send(error)
    }
});

//Uploads Profile image
const upload = multer({
    limits:{
        fileSize:2000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error(("Please upload either a jpg, jpeg, or png file!")))
        }

        cb(undefined,true)
    }
});

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res)=>{
    try{
        const buffer = await sharp(req.file.buffer).resize({width:250,height:250}).png().toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.status(200).send(req.user)
    }catch(error){
        res.status(500).send(error)
    }


},(error,req,res,next)=>{
    res.status(400).send({error:error.message})
});

//Deletes Profile image
router.delete('/users/me/avatar', auth, async (req, res)=>{
    try{
        req.user.avatar = undefined;
        await req.user.save()
        res.status(200).send("Avatar successfully deleted")
    }catch(error){
        res.status(500).send(error)
    }

});

//Serves Profile image
router.get('/users/:id/avatar',async (req,res)=>{
    try{
        const user = await User.findById(req.params.id);
        if(!user || !user.avatar){
            return res.status(404).send()
        }
        res.set('content-type','image/png');
        res.status(200).send(user.avatar)
    }catch(error){
        res.status(500).send(error)
    }
});

//Delete a User
router.delete('/users/me', auth, async (req,res)=>{
    try{
        await req.user.remove();
        sendCancellationEmail(req.user.email,req.user.name);
        res.status(200).send(req.user);
    }catch(error){
        res.status(500).send(error)
    }
});


module.exports = router;
