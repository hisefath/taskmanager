const {
    Schema,
    model
} = require('mongoose');
const _ = require('lodash');
const {
    sign,
    randomBytes,
    genSalt,
    hash,
    compare
} = require('../../functions/promisifiedFunctions');

// JWT Secret
const jwtSecret = "80r12a98n41d02o94m8234s12t34r31i40n33g";

const UserSchema = new Schema({
    "email": {
        "type": String,
        "required": true,
        "minlength": 1,
        "trim": true,
        "unique": true
    },
    "password": {
        "type": String,
        "required": true,
        "minlength": 5
    },
    "sessions": [
{
        "token": {
            "type": String,
            "required": true
        },
        "expiresAt": {
            "type": Number,
            "required": true
        }
    }
]
});

//------- INSTANCE METHODS ------- //

UserSchema.methods.toJSON = () => {
    const userObject = this.toObject();

    //Return the document except password and session
    return _.omit(userObject, [
        'password',
        'sessions'
    ]);
}

// eslint-disable-next-line require-await
UserSchema.methods.generateAccessAuthToken = async function () {
    //Create JSON Web Token and return it
    return sign({
        "_id": this._id.toHexString()
    }, jwtSecret, {
        "expiresIn": "15m"
    });

}

//This method willl generate a random 64 Byte Hex string 
//dont need to save to mongodb bc saveSessionToDatabase() does it
UserSchema.methods.generateRefreshAuthToken = async () => {
    return (await randomBytes(64)).toString('hex');
}

UserSchema.methods.createSession = async function () {

    try {
        let refreshToken = await this.generateRefreshAuthToken()
        await saveSessionToDatabase(this, refreshToken);
        return refreshToken;
    } catch (err) {
        throw new Error(`Failed to save session to databse.\n${err}`)
    }
}

//----- MODEL METHODS ------- //
// these are just static methods, can be called inside this file but not on an instance of this model
UserSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}

// eslint-disable-next-line require-await
UserSchema.statics.findByIdAndToken = async function (_id, token) {
    //finds user by id and token
    //used in auth middleware (verifySession)
    return this.findOne({
        _id,
        'sessions.token': token
    });
}

UserSchema.statics.findByCredentials = async function (email, password) {

    try {
        let retrieved_user = await this.findOne({
            email
        });
        if (!retrieved_user) {
            throw new Error("No User Found.");
        }
        if (await compare(password, this.password)) {
            return this
        } else {
            throw new Error();
        }
    } catch (err) {
        throw new Error(err);
    }
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
UserSchema.pre('save', async function (next) {
    let costFactor = 10; //how long it takes to hash our passwords

    if (this.isModified('password')) {
        //if the password has been changed or edited, run this code
        //generate salt and hash password
        let salt = await genSalt(costFactor);
        let pswd_hash = await hash(this.password, salt)
        this.password = pswd_hash;
        next();
    } else {
        next();
    }
});

//----- HELPER METHODS ------- //
let saveSessionToDatabase = async (user, refreshToken) => {
    //save session to db
    let expiresAt = generateRefreshTokenExpiryTime();

    user.sessions.push({
        'token': refreshToken,
        expiresAt
    });

    //new token is pushed to sessions array, now we have to save user document to db
    try {
        await user.save()
        return refreshToken()
    } catch (e) {
        throw new Error(e);
    }
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = daysUntilExpire * 24 * 60 * 60;
    return Date.now() / 1000 + secondsUntilExpire;
}

const User = model('User', UserSchema);

module.exports = User;