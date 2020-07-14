const { Schema, model, Types } = require('mongoose');

const TaskSchema = new Schema({
    "title": {
        "type": String, 
        "required": true,
        "minlength": 1, 
        "trim": true
    },
    "_listId": {
        "type": Types.ObjectId,
        "required": true
    },
    "completed": {
        "type": Boolean,
        "default": false
    }
});

const Task = model('task', TaskSchema);
module.exports = Task;