const MongoClient = require('mongoose');
const userSchema = new MongoClient.Schema({
    'image': {
        src: {
            type: MongoClient.Schema.Types.String,
            required: [false, 'required'],
            unique: [false, 'unique'],
        },
        mimetype: {
            type: MongoClient.Schema.Types.String,
        }
    },
    'role': {
        type: MongoClient.Schema.Types.ObjectId,
        required: [true, 'required'],
        unique: [false, 'unique'],
        ref: "role",
    },
    'doctor': {
        type: MongoClient.Schema.Types.ObjectId,
        required: [false, 'required'],
        unique: [false, 'unique'],
        ref: "user",
    },
    'email': {
        type: MongoClient.Schema.Types.String,
        required: [true, 'required'],
        unique: [true, 'unique'],
    },
    'password': {
        type: MongoClient.Schema.Types.String,
        required: [true, 'required'],
        unique: [false, 'unique'],
    },
    'name': {
        type: MongoClient.Schema.Types.String,
        required: [false, 'required'],
        unique: [false, 'unique'],
    },
    'status': {
        type: MongoClient.Schema.Types.Boolean,
        required: [false, 'required'],
        unique: [false, 'unique'],
        default: true,
    },
    'createdAt': {
        type: MongoClient.Schema.Types.Date,
        
        required: [false, 'required'],
        unique: [false, 'unique'],
        default: new Date(),
    },
    'updatedAt': {
        type: MongoClient.Schema.Types.Date,
        
        required: [false, 'required'],
        unique: [false, 'unique'],
        default: new Date(),
    },
    'phone': {
        type: MongoClient.Schema.Types.String,
        required: [false, 'required'],
        unique: [false, 'unique'],
    },
    'gender': {
        type: MongoClient.Schema.Types.String,
        required: [false, 'required'],
        unique: [false, 'unique'],
        enums:['male','female']
    },
    'age': {
        type: MongoClient.Schema.Types.Number,
        required: [false, 'required'],
        unique: [false, 'unique']
    },
}, {
    timeStamps: true,
});
userSchema.index({
    "name": "text",
});
const User = MongoClient.model('user', userSchema);
module.exports = User