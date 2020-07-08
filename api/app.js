const express = require('express');
const app = express();
const bodyParser = require('body-parser');
 
const mongoose = require('./db/mongoose');

/*---Load Middleware---*/
app.use(bodyParser.json());

/* ---Load Mongoose Models--*/
const { List, Task } = require('./db/models');

/* -----ROUTE HANDLERS-----*/

/* LIST ROUTES */

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
 * Return: Updated list document
 */
app.patch('/lists/:id', (req, res) => {
    //need CORS Headers
});

/**
 * DELETE /lists/:id
 * Purpose: Delete specified list
 * Return: Nada
 */ 
app.delete('/lists/:id', (req, res) => {
    //todo
});

app.listen(3000,  () => {
    console.log('server is listening on port 3000');
});