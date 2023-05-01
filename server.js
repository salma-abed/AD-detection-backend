const express = require('express');
const app = express();
const port = 8080;
const translate = require('./translate/translate');
const MongoClient = require('mongoose');
require('dotenv').config()

const url = `mongodb+srv://salma1910328:Miuproject2023@cluster0.r9w9tyv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`; //server
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.set('trust proxy', true)

const deleteUploadedOnError = require('./function').deleteUploadedOnError
const cors = require('cors');

app.use(express.json()); // accepted Json On Request
app.use(express.static('./public')); // Set Public Folder
app.use(cors());
MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false

});

// Start swagger 
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    swaggerDefinition: {
        openapi: '3.0.1',
        info: {
            title: 'Ad Detection Api Docs'
        },
        servers: [
            {
                url: `${process.env.API_URL}/api`,
            },
            {
                url: "http://localhost:8080/api"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        },
        security: {
            bearerAuth: []
        }
    },
    apis: [
        "./user/user.route.js",
        "./role/role.route.js",
        "./contact/contact.route.js",
        "./subscribe/subscribe.route.js",
    ]
};

const SwaggerSpace = swaggerJsdoc(options)


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(SwaggerSpace));

const userRouter = require('./user/user.route');
app.use('/api/user', userRouter);
const reportRouter = require('./report/report.route');
app.use('/api/report', reportRouter);
const roleRouter = require('./role/role.route');
app.use('/api/role', roleRouter);
const contactRouter = require('./contact/contact.route');
app.use('/api/contact', contactRouter);
const subscribeRouter = require('./subscribe/subscribe.route');
app.use('/api/subscribe', subscribeRouter);

app.use((err, req, res, next) => {
    let lang = req?.headers?.lang || "en";
    deleteUploadedOnError(req);
    if (err.message.startsWith("E11000 duplicate key error")) {
        res.status(500).send({
            status: err.status,
            code: "alreadyExisted",
            message: translate("error.alreadyExisted", lang),
        });
    } else {
        var index = err.message.indexOf('validation failed:');
        if (index != -1) {
            var messageMap = err.message?.split("validation failed:")[1]?.split(",").map(messageObject => {
                return '"' + messageObject?.split(":")[0]?.replace(/ /g, '')?.replace(/"/g, '') + '"' + ':"' + messageObject?.split(":")[1]?.replace(/"/g, '"')?.replace(/\/\//g, ',')?.replace(/\|\|/g, ',')?.replace(/"/g, '') + '"'
            });
            err.message = JSON.parse('{' + messageMap + '}');
            if (typeof err.message == 'object') {
                let values = Object.values(err.message);
                let keys = Object.keys(err.message);
                values?.forEach((value, i) => {
                    let key = keys[i];
                    let translatedKey = translate('keys.' + key?.replace(/./, "_"), lang);
                    value = value?.trim();
                    let error = translate("error." + value, lang, {
                        field: translatedKey || key || "Field"
                    });
                    err.code = value;
                    err.message[key] = error || value

                })
            }
        }
        res.status(500).send({
            status: err.status,
            code: err?.code,
            message: err.message,
        });
    }
});
app.use((req, res, next) => {
    let lang = req?.headers?.lang || "en";
    res.status(404).send({
        status: 404,
        code: "apiNotFound",
        message: translate("error.apiNotFound", lang),
    });
});

app.listen(process.env.PORT || port, () => {
    console.log('http://localhost:' + port);
});