const { Schema, model, Types } = require('mongoose');

const ListSchema = new Schema({
    "title": {
        "type": String, 
        "required": true,
        "minlength": 1, 
        "trim": true
    },    
    // with auth
    "_userId": {
        "type": Types.ObjectId,
        "required": true
    }
});

const List = model('list', ListSchema);
module.exports = List;