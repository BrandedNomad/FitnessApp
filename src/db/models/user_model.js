const mongoose = require('mongoose');
const validator =require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const TestResults = require('./test_results_model');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    age:{
        type:Number,
        required:true,
    },
    gender:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(value !== 'male'){

            }
        }
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error("Please provide a valid email")
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        min:6,
        validate(value){
            if(value.toLowerCase().includes("password") || value.toLowerCase().includes(this.name )){
                throw new Error('Password cannot be "password" or your name')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer,
    }
},{
    timestamps:true
});

//virtual relationships
userSchema.virtual('testResults',{
    ref:'TestResults',
    localField:'_id',
    foreignField:'owner'
});

//Instance methods

//Returns only public data
userSchema.methods.toJSON = function(){
    const user = this;
    const publicUserInfo = user.toObject();

    delete publicUserInfo.password;
    delete publicUserInfo.tokens;
    delete publicUserInfo.avatar;

    return publicUserInfo
};

//Generates a Web token for sessions
userSchema.methods.generateAuthToken = async function(){
    const user = this;
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_KEY);
    user.tokens = user.tokens.concat({token:token});
    await user.save();
    return token;
};

//Object methods

//Verifies user credentials for login
userSchema.statics.findByCredentials = async (email,password)=>{

    const user = await User.findOne({email}); //checks if email exists and returns user if it does

    if(!user){
        throw new Error('Unable to login') //if user does not exist throws an error
    }

    const isMatch = await bcrypt.compare(password,user.password); //checks if provided password matches stored password

    if(!isMatch){
        throw new Error('Unable to login') // throws an error if passwords don't match
    }

    return user
};


//Middleware

//Hashes password before saving
userSchema.pre('save', async function(next){
    const user = this;
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()

});

//Deletes all user related tasks, when user account is deleted
userSchema.pre('remove', async function(next){
    const user = this;
    await TestResults.deleteMany({owner:user._id});

    next()
});


//Creates User model
const User = mongoose.model('User',userSchema);

//Export
module.exports = User;