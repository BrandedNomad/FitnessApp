const mongoose = require('mongoose');

const testResultsSchema = mongoose.Schema({
    pushUps:{
        type:Number,
        default:0,
    },
    sitUps:{
        type:Number,
        default:0
    },
    pullUps:{
        type:Number,
        default:0
    },
    plank:{
        type:Number,
        default:0
    },
    vo2:{
        type:Number,
        default:0
    },
    run:{
        type:Number,
        default:0
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
});

//Create model
const TestResults = mongoose.model('TestResults', testResultsSchema);

//export

module.exports = TestResults;