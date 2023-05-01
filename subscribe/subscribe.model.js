const MongoClient = require('mongoose');
const subscribeSchema = new MongoClient.Schema({
    'createdAt': {
        type: MongoClient.Schema.Types.Date,
        
        required: [false, 'required'],
        unique: [false, 'unique'],
        default: new Date(),
    },
    'email': {
        type: MongoClient.Schema.Types.String,
        required: [true, 'required'],
        unique: [true, 'unique'],
        default: "",
        
    },
    'updatedAt': {
        type: MongoClient.Schema.Types.Date,
        
        required: [false, 'required'],
        unique: [false, 'unique'],
        default: new Date(),
    },
    'status': {
        type: MongoClient.Schema.Types.Boolean,
        required: [false, 'required'],
        unique: [false, 'unique'],
    },
}, {
    timeStamps: true,
});
subscribeSchema.index({
    "email": "text",
})
const Subscribe = MongoClient.model('subscribe', subscribeSchema);
module.exports = Subscribe