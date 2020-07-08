const express = require('express');
const app = express();

/* -----ROUTE HANDLERS-----*/

/* LIST ROUTES */

/**
 * GET /lists 
 * Purpose: Get all lists
 * Return: Array of all lists
 */
app.get('/lists', (req, res) => {
    //todo
});

/**
 * POST /lists
 * Purpose: Create new list
 * Return: New list document 
 */
app.post('/lists', (req, res) => {
    //todo
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