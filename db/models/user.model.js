const mongoose = require('mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// JWT Secret
const jwtSecret = "80r12a98n41d02o94m8234s12t34r31i40n33g";

const UserSchema = new mongoose.Schema({
    email: {
        type: String, 
        required: true, 
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true, 
        minlength: 5, 
    },
    sessions: [{
         token: {
             type: String, 
             required: true
         },
         expiresAt:{
              type: Number,
              required: true
         }
    }]
});

//------- INSTANCE METHODS ------- //

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();

    //Return the document except password and session
    return _.omit(userObject, ['password','sessions']);
}

UserSchema.methods.generateAccessAuthToken = function() {
    const user = this;
    return new Promise((resolve, reject) => {
        //Create JSON Web Token and return it
        jwt.sign({ _id: user._id.toHexString() }, jwtSecret, { expiresIn: "15m" }, (err, token) => {
            if(!err){
                resolve(token);
            } else {
                reject();
            }
        });
    });
}

//This method willl generate a random 64 Byte Hex string 
//dont need to save to mongodb bc saveSessionToDatabase() does it
UserSchema.methods.generateRefreshAuthToken = function() {
    return new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buffer) => {
            if (!err) {
                // no error
                let token = buffer.toString('hex');

                return resolve(token);
            }
        });
    });
}

UserSchema.methods.createSession = function() {
    let user = this;

    return user.generateRefreshAuthToken().then((refreshToken) => {
        return saveSessionToDatabase(user, refreshToken);
    }).then((refreshToken) => {
        //now session is created and saved to db succesfully
        // now lets return the refreshToken
        return refreshToken;
    }).catch((err) => {
        return Promise.reject('Failed to save session to databse.\n'+err);
    });
}

//----- MODEL METHODS ------- //
// these are just static methods, can be called inside this file but not on an instance of this model
UserSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}

UserSchema.statics.findByIdAndToken = function(_id, token) {
    //finds user by id and token
    //used in auth middleware (verifySession)
    const User = this;
    // return User.findByCredentials('hi1@gmail.com', 'helloman');
    // console.log(_id);
    // console.log(token);
    return User.findOne({
        _id, 
        'sessions.token': token
    });
    // // console.log(user);
    // return user;
}

UserSchema.statics.findByCredentials = function (email, password) {
    let user = this;
    return user.findOne({ email }).then((user) => {
        if (!user) return Promise.reject();

        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) { resolve(user); }
                else { reject(); }
            });
        });
    });
}

UserSchema.statics.hasRefreshTokenExpired = (expiresAt) => {
    let secondsSinceEpoch = Date.now() / 1000;
    if (expiresAt > secondsSinceEpoch) {
        //hasnt expired
        return false;
    } else {
        //has expired
        return true;
    }
}


//----- MIDDLEWARE METHODS ------- //
//before a user document is saved, we hash the password
UserSchema.pre('save', function(next) {
    let user = this;
    let costFactor = 10; //how long it takes to hash our passwords

    if(user.isModified('password')){
    //if the password has been changed or edited, run this code
    //generate salt and hash password
    bcrypt.genSalt(costFactor, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            user.password = hash;
            next();
        });
    });
    } else {
        next();
    }
});

//----- HELPER METHODS ------- //
let saveSessionToDatabase = (user, refreshToken) => {
    //save session to db
    return new Promise((resolve, reject) => {
        let expiresAt = generateRefreshTokenExpiryTime();
        
        user.sessions.push({ 'token': refreshToken, expiresAt });

        //new token is pushed to sessions array, now we have to save user document to db
        user.save().then(() => {
            //saved session succesfully
            return resolve(refreshToken);
        }).catch((err) => {
            reject(err);
        });
    });
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

const User = mongoose.model('User', UserSchema);

module.exports = { User }