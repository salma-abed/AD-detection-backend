const MongoClient = require('mongoose');
const roleSchema = new MongoClient.Schema({
    'title': {
        "en":{
            type: MongoClient.Schema.Types.String,
            required: [true, 'required'],
            unique: [true, 'unique'],
        },
        "ar":{
            type: MongoClient.Schema.Types.String,
            required: [true, 'required'],
            unique: [true, 'unique'],
        },
    },
    'type': {
        type: MongoClient.Schema.Types.String,
        required: [true, 'required'],
        unique: [true, 'unique'],
    },
    'default': {
        type: MongoClient.Schema.Types.Boolean,
        required: [true, 'required'],
        unique: [false, 'unique'],
        default:false
    },
    'adminPanel': {
        type: MongoClient.Schema.Types.Boolean,
        required: [true, 'required'],
        unique: [false, 'unique'],
        default:false
    },
    'seq': {
        type: MongoClient.Schema.Types.Number,
        required: [false, 'required'],
        unique: [false, 'unique'],
        default:0
    },
    'receivedNotificationsInDB': {
        type: MongoClient.Schema.Types.Boolean,
        required: [true, 'required'],
        unique: [false, 'unique'],
        default:false
    },
    'app': {
        type: MongoClient.Schema.Types.String,
        required: [true, 'required'],
        unique: [false, 'unique'],
        enums:['all','dashboard','frontend-app'],
        default:'all'
    },
    'level': {
        type: MongoClient.Schema.Types.Number,
        required: [true, 'required'],
        unique: [false, 'unique'],
        default:1
    },
    'levelType': {
        type: MongoClient.Schema.Types.String,
        required: [true, 'required'],
        unique: [false, 'unique'],
        enums:['$gt','$gte'],
        default:'$gt'
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
    'status': {
        type: MongoClient.Schema.Types.Boolean,
        required: [false, 'required'],
        unique: [false, 'unique'],
        default: true,
    },
    collections: {
        user: {
            'collection-type': {
                type: String,
                default: 'public',
                enum: ['public', 'private'],
                required: [true, 'required']
            },
            methods: {
                get: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                getOne: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                put: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                post: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                delete: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
            }
        },
        role: {
            'collection-type': {
                type: String,
                default: 'public',
                enum: ['public', 'private'],
                required: [true, 'required']
            },
            methods: {
                get: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                getOne: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                put: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                post: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                delete: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
            }
        },
        report: {
            'collection-type': {
                type: String,
                default: 'public',
                enum: ['public', 'private'],
                required: [true, 'required']
            },
            methods: {
                get: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                getOne: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                put: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                post: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                delete: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
            }
        },
        contact: {
            'collection-type': {
                type: String,
                default: 'public',
                enum: ['public', 'private'],
                required: [true, 'required']
            },
            methods: {
                get: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                getOne: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                put: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                post: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                delete: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
            }
        },
        subscribe: {
            'collection-type': {
                type: String,
                default: 'public',
                enum: ['public', 'private'],
                required: [true, 'required']
            },
            methods: {
                get: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                getOne: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                put: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                post: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
                delete: {
                    type: Boolean,
                    default: true,
                    required: [true, 'required']
                },
            }
        },
    }
}, {
    timeStamps: true,
});
roleSchema.index({})
const Role = MongoClient.model('role', roleSchema,'roles');
module.exports = Role