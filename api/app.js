const express = require('express');
const app = express();
const bodyParser = require('body-parser');
 
const mongoose = require('./db/mongoose');

/*---Load Middleware---*/
app.use(bodyParser.json());

/* ---Load Mongoose Models--*/
const { List, Task } = require('./db/models');

/* -----ROUTE HANDLERS-----*/

/* START OF LIST ROUTES */

/**
 * GET /lists 
 * Purpose: Get all lists
 * Return: Array of all lists
 */
app.get('/lists', (req, res) => {
    List.find({}).then((lists) => {
        res.send(lists);
    });
});

/**
 * POST /lists
 * Purpose: Create new list
 * Return: New list document 
 */
app.post('/lists', (req, res) => {
    let title = req.body.title;
    let newList = new List({
        title
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
app.patch('/lists/:id', (req, res) => {
    //need CORS Headers to use PATCH api
    List.findOneAndUpdate({ _id: req.params.id }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });
});

/**
 * DELETE /lists/:id
 * Purpose: Delete specified list
 * Return: Deleted list doc
 */ 
app.delete('/lists/:id', (req, res) => {
    List.findOneAndRemove({ _id: req.params.id })
        .then((removedListDoc) => {
            res.send(removedListDoc);
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
app.get('/lists/:listId/tasks', (req, res) => {
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
app.get('/lists/:listId/tasks/:taskId', (req, res) => {
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
app.post('/lists/:listId/tasks', (req, res) => {
    let newTask = new Task({
        title: req.body.title,
        _listId: req.params.listId
    });
    newTask.save().then((newTaskDoc) => {
        res.send(newTaskDoc);
    });
});

/**
 * Patch /lists/:listId/tasks/:taskId
 * Purpose: Update a task in specified list
 * Return: http200
 */
app.patch('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndUpdate({ 
        _id: req.params.taskId,
        _listId: req.params.listId
    }, {
        $set: req.body
    }).then(() => {
        res.sendStatus(200);
    });
});

/**
 * DELETE /lists/:listId/tasks/:taskId
 * Purpose: Delete a task in specified list
 * Return: Deleted task doc
 */
app.delete('/lists/:listId/tasks/:taskId', (req, res) => {
    Task.findOneAndRemove( { 
        _id: req.params.taskId, 
        _listId: req.params.listId 
    }).then((removedTaskDoc) => {
        res.send(removedTaskDoc);
    });
});


/* END OF TASK ROUTES */


app.listen(3000,  () => {
    console.log('server is listening on port 3000');
});