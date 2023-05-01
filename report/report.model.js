const MongoClient = require('mongoose');
const reportSchema = new MongoClient.Schema({
    'patient': {
        type: MongoClient.Schema.Types.ObjectId,
        required: [true, 'required'],
        unique: [false, 'unique'],
        ref:'user'
    },
    'doctor': {
        type: MongoClient.Schema.Types.ObjectId,
        required: [true, 'required'],
        unique: [false, 'unique'],
        ref:'user'
    },
    'user': {
        type: MongoClient.Schema.Types.ObjectId,
        required: [false, 'required'],
        unique: [false, 'unique'],
        ref:'user'
    },
    'notes': {
        type: MongoClient.Schema.Types.String,
        required: [false, 'required'],
        unique: [false, 'unique'],
    },
    'comments': [{
        from: {
            type: MongoClient.Schema.Types.ObjectId,
            required: [false, 'required'],
            unique: [false, 'unique'],
            ref:'user'
        },
        userType:{
            type: MongoClient.Schema.Types.String,
            required: [false, 'required'],
            unique: [false, 'unique'],
        },
        comment:{
            type: MongoClient.Schema.Types.String,
            required: [false, 'required'],
            unique: [false, 'unique'],
        }
    }],
    'file': {
        src: {
            type: MongoClient.Schema.Types.String,
            required: [false, 'required'],
            unique: [false, 'unique'],
        },
        mimetype: {
            type: MongoClient.Schema.Types.String,
        }
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
    }
}, {
    timeStamps: true,
});
reportSchema.index({})
const Report = MongoClient.model('report', reportSchema);
module.exports = Report