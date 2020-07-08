// This file will handle connection logic to MongoDB Database
const mongoose = require ('mongoose');
//override mongoose default bluebird promise and use js global promise
mongoose.Promise = global.Promise();
mongoose.connect('didntwork, will udse dotenv');