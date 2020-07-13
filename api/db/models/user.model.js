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
        expiresAt: {
            type: Number,
            required: true
        }
    }]
});

//------- INSTANCE METHODS ------- //

UserSchema.methods.toJSON = () => {
    const user = this;
    const userObject = user.toObject();

    //Return the document except password and session
    return _.omit(userObject, ['password', 'sessions']);
}

UserSchema.methods.generateAccessAuthToken = async function () {
    const user = this;
    //Create JSON Web Token and return it
    try {
        return await sign({
            _id: user._id.toHexString()
        }, jwtSecret, {
            expiresIn: "15m"
        });
    } catch (err) {
        throw err;
    }
}

//This method willl generate a random 64 Byte Hex string 
//dont need to save to mongodb bc saveSessionToDatabase() does it
UserSchema.methods.generateRefreshAuthToken = async () => {
    return (await randomBytes(64)).toString('hex');
}

UserSchema.methods.createSession = async function () {
    let user = this;

    try {
        let refreshToken = await user.generateRefreshAuthToken()
        await saveSessionToDatabase(user, refreshToken);
        return refreshToken;
    } catch (err) {
        throw new Error('Failed to save session to databse.\n' + err)
    }
}

//----- MODEL METHODS ------- //
// these are just static methods, can be called inside this file but not on an instance of this model
UserSchema.statics.getJWTSecret = () => {
    return jwtSecret;
}

UserSchema.statics.findByIdAndToken = async function (_id, token) {
    //finds user by id and token
    //used in auth middleware (verifySession)
    const User = this;
    return await User.findOne({
        _id,
        'sessions.token': token
    });
}

UserSchema.statics.findByCredentials = async function (email, password) {
    let user = this;

    try {
        let retrieved_user = await user.findOne({
            email
        });
        if (!retrieved_user) throw new Error("No User Found.");
        if (await compare(password, user.password))
            return user
        else throw new Error();
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
    let user = this;
    let costFactor = 10; //how long it takes to hash our passwords

    if (user.isModified('password')) {
        //if the password has been changed or edited, run this code
        //generate salt and hash password
        let salt = await genSalt(costFactor);
        let hash = await hash(user.password, salt)
        user.password = hash;
        next();
    } else {
        next();
    }
});

//----- HELPER METHODS ------- //
let saveSessionToDatabase = async (user, refreshToken) => {
    //save session to db
    let expiresAt = generateRefreshTokenExpiryTime();

    user.sessions.push({'token': refreshToken, expiresAt });

    //new token is pushed to sessions array, now we have to save user document to db
    try {
        await user.save()
        return refreshToken()
    } catch(e) {
        throw new Error(e);
    }
}

let generateRefreshTokenExpiryTime = () => {
    let daysUntilExpire = "10";
    let secondsUntilExpire = ((daysUntilExpire * 24) * 60) * 60;
    return ((Date.now() / 1000) + secondsUntilExpire);
}

const User = model('User', UserSchema);

module.exports = User;