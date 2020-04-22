//Import modules
const express = require('express');

//Import data models
require('./db/mongoose');
const UserRouter = require('./routers/user_router');
const TestResultRouter = require('./routers/test_results_router');

//create server
const server = express();

//Server configuration
const port = process.env.PORT || 3000; //Port
server.use(express.json()); //Json parser


//Route handlers
server.use(UserRouter);
server.use(TestResultRouter);

//Start server
server.listen(port,(error,response)=>{
    if(error){
        console.log(error)
    }else{
        console.log("Server up and running on port: " + port)
    }
});

