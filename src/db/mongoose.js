const mongoose = require('mongoose');

const connectionString = "mongodb://127.0.0.1:27017/fitness-app";

mongoose.connect(connectionString,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true,useFindAndModify:false} );

