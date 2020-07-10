const express = require('express');
const app = express();
const bodyParser = require('body-parser');
 
const mongoose = require('./db/mongoose');


/* ---Load Mongoose Models--*/
const { List, Task, User } = require('./db/models');
const jwt = require('jsonwebtoken');

/*---Load Middleware---*/

//Response BodyParser Middleware
app.use(bodyParser.json());
//Cross-Origin Resource Sharing Middleware
//https://enable-cors.org/server.html
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");

    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );

    next();
});


// check whether the request has a valid JWT access token
let authenticate = (req, res, next) => {
    let token = req.header('x-access-token');

    // verify the JWT
    jwt.verify(token, User.getJWTSecret(), (err, decoded) => {
        if (err) {
            // there was an error
            // jwt is invalid - * DO NOT AUTHENTICATE *
            res.status(401).send(err);
        } else {
            // jwt is valid
            req.user_id = decoded._id;
            next();
        }
    });
}

// Verify Refresh Token Middleware (which will be verifying the session)
let verifySession = (req, res, next) => {
    // grab the refresh token from the request header
    let refreshToken = req.header('x-refresh-token');

    // grab the _id from the request header
    let _id = req.header('_id');

    User.findByIdAndToken(_id, refreshToken).then((user) => {
        console.log(user);
        if (!user) {
            // user couldn't be found
            return Promise.reject({
                'error': 'User not found. Make sure that the refresh token and user id are correct'
            });
        }

        // if the code reaches here - the user was found
        // therefore the refresh token exists in the database - but we still have to check if it has expired or not

        req.user_id = user._id;
        req.userObject = user;
        req.refreshToken = refreshToken;

        let isSessionValid = false;

        user.sessions.forEach((session) => {
            if (session.token === refreshToken) {
                // check if the session has expired
                if (User.hasRefreshTokenExpired(session.expiresAt) === false) {
                    // refresh token has not expired
                    isSessionValid = true;
                }
            }
        });

        if (isSessionValid) {
            // the session is VALID - call next() to continue with processing this web request
            next();
        } else {
            // the session is not valid
            return Promise.reject({
                'error': 'Refresh token has expired or the session is invalid'
            })
        }

    }).catch((e) => {
        res.status(401).send(e);
    })
}
/* END MIDDLEWARE  */


/* -----ROUTE HANDLERS-----*/

/* START OF LIST ROUTES */

/**
 * GET /lists 
 * Purpose: Get all lists that belong to an authenticated user
 * Return: Array of all lists
 */
app.get('/lists', authenticate, (req, res) => {
    // We want to return an array of all the lists that belong to the authenticated user 
    List.find({
        _userId: req.user_id
    }).then((lists) => {
        res.send(lists);
    }).catch((err) => {
        res.send(err);
    });
})

/**
 * POST /lists
 * Purpose: Create new list
 * Return: New list document 
 */
app.post('/lists', authenticate, (req, res) => {
    let title = req.body.title;
    let newList = new List({
        title,
        _userId: req.user_id
    });
    newList.save().then((listDoc) => {
        //full list document is returned
        res.send(listDoc);
    });
});

/**
 * PATCH /lists/:id
 * Purpose: Update specified list
 * Return: http200
 */
app.patch('/lists/:id', authenticate, (req, res) => {
    //need CORS Headers to use PATCH api
    List.findOneAndUpdate({ _id: req.params.id, _userId: req.user_id }, {
        $set: req.body
    }).then(() => {
        res.send({ message: 'updated successfully' });
    });
});

/**
 * DELETE /lists/:id
 * Purpose: Delete specified list
 * Return: Deleted list doc
 */ 
app.delete('/lists/:id', authenticate, (req, res) => {
    List.findOneAndRemove({ _id: req.params.id, _userId: req.user_id })
        .then((removedListDoc) => {
            res.send(removedListDoc);
            //delete all tasks in that deleted list
            deleteTasksFromList(removedListDoc._id);
        });
});

/* END OF LIST ROUTES */
/* ------------------- */
/* START OF TASK ROUTES */

/**
 * GET /lists/:listId/tasks
 * Purpose: Get all task per specified list
 * Return: Array of all tasks
 */
app.get('/lists/:listId/tasks', authenticate, (req, res) => {
    Task.find({ _listId: req.params.listId })
        .then((tasks) => {
            res.send(tasks);
        });
});

/**
 * GET /lists/:listId/task/:taskId
 * Purpose: Get a single task in specified list
 * Return: Specified task doc
 */
app.get('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    Task.findOne( {
        _id: req.params.taskId,
        _listId: req.params.listId
    }).then((taskDoc) => {
        res.send(taskDoc);
    });
})

/**
 * POST /lists/:listId/tasks 
 * Purpose: Create new task in specified list
 * Return: The new task document
 */
app.post('/lists/:listId/tasks', authenticate, (req, res) => {
    //check if authenticated user has access to list id passed in
    List.findOne({
        _id: req.params.listId,
        _userId: req.user_id
    }).then((list)=>{
        if(list) {
            //user object is valid
            //this user can create new tasks in this list
            return true;
        } else {
            //user object is undefined
            return false;
        }
    }).then((canCreatetask) => {
        if(canCreatetask) {
        let newTask = new Task({
            title: req.body.title,
            _listId: req.params.listId
        });
        newTask.save().then((newTaskDoc) => {
            res.send(newTaskDoc);
        });
        } else {
            res.sendStatus(404);
        }
    });
});

/**
 * Patch /lists/:listId/tasks/:taskId
 * Purpose: Update a task in specified list
 * Return: http200
 */
app.patch('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    List.findOne({ 
        _id: req.params._listId,
        _userId: user_id
    }).then((list) => {
        //authenticated user can access this list
        if(list){
            return true;
        } else {
            return false;
        }
    }).then((canUpdateTasksInThisList)=>{
        if(canUpdateTasksInThisList){
            Task.findOneAndUpdate({ 
                _id: req.params.taskId,
                _listId: req.params.listId
            }, {
                $set: req.body
            }).then(() => {
                res.send({ message: 'updated successfully' });
            });
        } else {
            res.sendStatus(404);
        }
    });
});

/**
 * DELETE /lists/:listId/tasks/:taskId
 * Purpose: Delete a task in specified list
 * Return: Deleted task doc
 */
app.delete('/lists/:listId/tasks/:taskId', authenticate, (req, res) => {
    List.findOne({ 
        _id: req.params._listId,
        _userId: user_id
    }).then((list) => {
        //authenticated user can access this list
        if(list){
            return true;
        } else {
            return false;
        }
    }).then((canDeleteTasksInThisList)=>{
        if(canDeleteTasksInThisList){
            Task.findOneAndRemove( { 
                _id: req.params.taskId, 
                _listId: req.params.listId 
            }).then((removedTaskDoc) => {
                res.send(removedTaskDoc);
            });
        } else {
            res.sendStatus(404);
        }
    });
});


/* END OF TASK ROUTES */
/* ------------------- */
/* START OF USER ROUTES */

/**
 * POST /users/signup
 * Purpose: Create user
 * Return: User document
 */
app.post('/users/signup', (req, res) => {
    //user sign up
    let body = req.body;
    let newUser = new User(req.body);
    newUser.save().then(() => {
        return newUser.createSession();
    }).then((refreshToken) => {
        //session created successfully - refresh token also returned
        //now we have to generate access auth token for the user
        return  newUser.generateAccessAuthToken().then((accessToken) => {
            //access auth token generated successfully
            return { accessToken, refreshToken };
        });
    }).then((authTokens) => {
        //now we construct and send the response to the user with their
        //auth token in header, and the user object in the body
        res
        .header('x-refresh-token', authTokens.refreshToken)
        .header('x-access-token', authTokens.accessToken)
        .send(newUser);
    }).catch((err) => {
        res.status(400).send(err);
    });
});

/**
 * POST /users/login
 * Purpose: Login user
 * Return: User document and redirect to taskview
 */
app.post('/users/login', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    User.findByCredentials(email, password).then((user) => {
        return user.createSession().then((refreshToken) => {
            //Session created successfully - refreshToken returned
            //n ow we generate an access auth token for the user

            return user.generateAccessAuthToken().then((accessToken) => {
                //access auth token generated successfully, 
                //now we return an object containing the auth token
                return { accessToken, refreshToken }
            });
        }).then((authTokens) => {
            res
            .header('x-refresh-token', authTokens.refreshToken)
            .header('x-access-token', authTokens.accessToken)
            .send(user);
        });
    }).catch((err) => {
        res.status(400).send(err);
    });
});

/**
 * GET /users/me/access-token
 * Purpose: generates and returns an access token
 */
app.get('/users/me/access-token', verifySession, (req, res) => {
    // we know that the user/caller is authenticated and we have the user_id and user object available to us
    req.userObject.generateAccessAuthToken().then((accessToken) => {
        res.header('x-access-token', accessToken).send({ accessToken });
    }).catch((e) => {
        res.status(400).send(e);
    });
});

/* HELPER METHODS */
let deleteTasksFromList = (_listId) => {
    Task.deleteMany({
        _listId
    }).then(() => {
        console.log("Tasks from " + _listId + " were all deleted, because respective list was deleted");
    })
}

app.listen(3000,  () => {
    console.log('server is listening on port 3000');
});