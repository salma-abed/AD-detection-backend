const MongoClient = require('mongoose');
const contactSchema = new MongoClient.Schema({
    'message': {
        type: MongoClient.Schema.Types.String,
        required: [true, 'required'],
        unique: [false, 'unique'],
    },
    'name': {
        type: MongoClient.Schema.Types.String,
        required: [false, 'required'],
        unique: [false, 'unique'],
    },
    'email': {
        type: MongoClient.Schema.Types.String,
        required: [false, 'required'],
        unique: [false, 'unique'],
    },
    'subject': {
        type: MongoClient.Schema.Types.String,
        required: [false, 'required'],
        unique: [false, 'unique'],
    },
    'phone': {
        type: MongoClient.Schema.Types.String,
        required: [false, 'required'],
        unique: [false, 'unique'],
    },
    'user': {
        type: MongoClient.Schema.Types.ObjectId,
        required: [false, 'required'],
        unique: [false, 'unique'],
        ref:'user'
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
    'attach': [{
        src: {
            type: MongoClient.Schema.Types.String,
            required: [false, 'required'],
            unique: [false, 'unique'],
        },
        mimetype: {
            type: MongoClient.Schema.Types.String,
        }
    }],
}, {
    timeStamps: true,
});
contactSchema.index({})
const Contact = MongoClient.model('contact', contactSchema);
module.exports = Contact