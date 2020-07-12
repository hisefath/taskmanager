require('dotenv').config();

// This file will handle connection logic to MongoDB Database
const mongoose = require('mongoose');
//override mongoose default bluebird promise and use js global promise
mongoose.Promise = global.Promise;

mongoose.connect(process.env.SECRET_MONGODB, { useNewUrlParser: true }).then(() => {
    console.log("Connected to MongoDB successfully c:");
}).catch((ex) => {
    console.log("Error while attempting to connect to MongoDB :c");
    console.log(ex);
});

// To prevent deprectation warnings (from MongoDB native driver)
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);


module.exports = {
    mongoose
};