const express = require('express');
const assert = require('assert');
const userRoute = express.Router();
const expressAsyncHandler = require('express-async-handler');
const User = require('./user.model');
const Role = require('../role/role.model');
const jwt = require('jsonwebtoken');
const auth = require('../function').auth;
const setSelectStatement = require('../function').setSelectStatement;
const sortSet = require('../function').sortSet
const collectionSet = require('./user.function').collectionSet
const searchSet = require('./user.function').searchSet
const fieldsTypeSet = require('./user.function').fieldsTypeSet
const mimeTypeCheck = require('../function').mimeTypeCheck
const upload = require('../function').upload
const deleteUploadedWhenEdit = require('../function').deleteUploadedWhenEdit
const deleteUploaded = require('../function').deleteUploaded
const uploadValidationsSet = require('./user.function').uploadValidationsSet
const emailCheck = require('../function').emailCheck;
const passwordHash = require('../function').passwordHash
const passwordCompare = require('../function').passwordCompare;
/**
  * @swagger
  * tags:
  *  name: User
  *  description: Api For User
  * /user/auth/admin-login:
  *  post:
  *    tags: [User] 
  *    security:
  *     - bearerAuth: []
  *    requestBody:
  *      required: true
  *      content:
  *        application/json:
  *          schema:
  *            type: object
  *            properties:
  *              email:
  *                type: string
  *                default: superadmin@halaween.com
  *              password:
  *                type: string
  *                default: 123456
  *            required:
  *              - email
  *              - password
  *    responses:
  *      '200':
  *        description: Created
  *      default:
  *        description: Created
  *        
  */
userRoute.post('/auth/admin-login', expressAsyncHandler(async (req, res) => {
    
    const user = await User.findOne({
        email: req.body.email
    }).populate('role', req.query["select-role"]).populate('country', req.query["select-country"]).populate('city', req.query["select-city"]).populate('area', req.query["select-area"]);
    assert(req.body.email, `user validation failed: email: required`)
    assert(req.body.password, `user validation failed: password: required`);
    assert(user != null, `user validation failed: email: emailIncorrect`)
    assert(passwordCompare(req.body.password, user.password), `user validation failed: password: passwordIncorrect`)
    let isAdmin = await Role.findOne({adminPanel:true,_id:user?.role?._id},'_id'); 
    assert(isAdmin, `user validation failed: role: unAuthorization`)

    await res.send({
        _id: user._id,
        'image': user['image'],
        'role': user['role'],
        'email': user['email'],
        'password': user['password'],
        'name': user['name'],
        'status': user['status'],
        'createdAt': user['createdAt'],
        'updatedAt': user['updatedAt'],
        'phone': user['phone'],
        token: jwt.sign({
            _id: user._id,
            'role': user['role']._id,
        }, 'seacret-key#1234567894121324874123154gjdfjagkdfhghdsgsahgfsdafgfaghjkfdsgjsk')
    })
}));
/**
  * @swagger
  * tags:
  *  name: User
  *  description: Api For User
  * /user/auth/login:
  *  post:
  *    tags: [User] 
  *    security:
  *     - bearerAuth: []
  *    requestBody:
  *      required: true
  *      content:
  *        application/json:
  *          schema:
  *            type: object
  *            properties:
  *              email:
  *                type: string
  *                default: superadmin@halaween.com
  *              password:
  *                type: string
  *                default: 123456
  *            required:
  *              - email
  *              - password
  *    responses:
  *      '200':
  *        description: Created
  *      default:
  *        description: Created
  *   
  */
userRoute.post('/auth/login', expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({
        email: req.body.email
    }).populate('role', req.query["select-role"]).populate('country', req.query["select-country"]).populate('city', req.query["select-city"]).populate('area', req.query["select-area"]);
    assert(req.body.email, `user validation failed: email: required`)
    assert(req.body.password, `user validation failed: password: required`);
    assert(user != null, `user validation failed: email: emailIncorrect`)
    assert(passwordCompare(req.body.password, user.password), `user validation failed: password: passwordIncorrect`)
    await res.send({
        _id: user._id,
        'image': user['image'],
        'role': user['role'],
        'email': user['email'],
        'password': user['password'],
        'name': user['name'],
        'status': user['status'],
        'createdAt': user['createdAt'],
        'updatedAt': user['updatedAt'],
        'phone': user['phone'],
        token: jwt.sign({
            _id: user._id,
            'role': user['role']._id,
        }, 'seacret-key#1234567894121324874123154gjdfjagkdfhghdsgsahgfsdafgfaghjkfdsgjsk')
    })
}));

/**
  * @swagger
  * tags:
  *  name: User
  *  description: Api For User
  * /user/auth/register:
  *  post:
  *    tags: [User] 
  *    security:
  *     - bearerAuth: []
  *    requestBody:
  *      required: true
  *      content:
  *        multipart/form-data:
  *          schema:
  *            type: object
  *            properties:
  *              image:
  *                type: string
  *                format: binary
  *              name:
  *                type: string
  *              phone:
  *                type: string
  *              birthDate:
  *                type: string
  *              country:
  *                type: string
  *              city:
  *                type: string
  *              area:
  *                type: string
  *              address:
  *                type: string
  *              status:
  *                type: boolean
  *                default: true
  *  
  *              email:
  *                type: string
  *                default: superadmin@halaween.com
  *              password:
  *                type: string
  *                default: 123456
  *            required:
  *               - email
  *               - password
  *    responses:
  *      '200':
  *        description: Created
  *      default:
  *        description: Created
  */
userRoute.post('/auth/register', fieldsTypeSet, emailCheck, passwordHash, uploadValidationsSet, collectionSet, mimeTypeCheck, upload, expressAsyncHandler(async (req, res) => {
    if (res.locals.collectionType == 'private') {
        if (req.body.user) {
            req.body.user = req.query.userIdForRoleType
        }
    }
    const userCreate = await User.create(req.body);
    const user = await User.findOne({email:req.body.email}).populate('role', req.query["select-role"]);
    await res.send({
        _id: user._id,
        'image': user['image'],
        'role': user['role'],
        'email': user['email'],
        'password': user['password'],
        'name': user['name'],
        'status': user['status'],
        'createdAt': user['createdAt'],
        'updatedAt': user['updatedAt'],
        'phone': user['phone'],
        token: jwt.sign({
            _id: user._id,
            'role': user['role']._id,
        }, 'seacret-key#1234567894121324874123154gjdfjagkdfhghdsgsahgfsdafgfaghjkfdsgjsk')
    })
}));
/**
  * @swagger
  * tags:
  *  name: User
  *  description: Api For User
  * /user/auth/profile:
  *  get:
  *    tags: [User]
  *    security:
  *     - bearerAuth: []
  *    responses:
  *      '200':
  *        description: Created
  *      default:
  *        description: Created
  */
userRoute.get('/auth/profile', expressAsyncHandler(async (req, res) => {
    const userByToken = await jwt.verify(req.headers.authorization ? req.headers.authorization.split(" ")[1] : '', 'seacret-key#1234567894121324874123154gjdfjagkdfhghdsgsahgfsdafgfaghjkfdsgjsk');
    assert(userByToken?._id,`${req?.collection} validation failed: token: unAuthorization`)
    const user = await User.findOne({
        _id: userByToken._id
    })
    .populate('role', req.query["select-role"]);
    await res.send(user)
}));
/**
  * @swagger
  * tags:
  *  name: User
  *  description: Api For User
  * /user/auth/edit-profile:
  *  put:
  *    tags: [User]
  *    security:
  *     - bearerAuth: []
  *    requestBody:
  *      required: true
  *      content:
  *        multipart/form-data:
  *          schema:
  *            type: object
  *            properties:
  *              image:
  *                type: string
  *                format: binary
  *              name:
  *                type: string
  *              birthDate:
  *                type: string
  *              country:
  *                type: string
  *                default: 62d6edd71da20a7e80892617
  *              city:
  *                type: string
  *              area:
  *                type: string
  *              address:
  *                type: string
  *    responses:
  *      '200':
  *        description: Created
  *      default:
  *        description: Created
  */
userRoute.put('/auth/edit-profile', fieldsTypeSet, emailCheck, passwordHash, uploadValidationsSet, collectionSet, mimeTypeCheck, upload, expressAsyncHandler(async (req, res) => {
    const userByToken = await jwt.verify(req.headers.authorization ? req.headers.authorization.split(" ")[1] : '', 'seacret-key#1234567894121324874123154gjdfjagkdfhghdsgsahgfsdafgfaghjkfdsgjsk');
    assert(userByToken?._id,`${req?.collection} validation failed: token: unAuthorization`)
    if(req?.body?.status){
        delete req?.body?.status
    }
    if(req?.body?.role){
        delete req?.body?.role
    }
    if(req?.body?.email){
        delete req?.body?.email
    }
    const userForFile = await User.findOne({_id: userByToken._id});
    assert(userForFile != null, `collection validation failed: item: notFound`);
    deleteUploadedWhenEdit(userForFile, req);
    const user = await User.findOneAndUpdate({
        _id: userByToken._id
    },req?.body,{new:true});
    req.body.updatedAt = new Date();
    await res.send(user);
}));
userRoute.post('/', fieldsTypeSet, emailCheck, passwordHash, uploadValidationsSet, collectionSet, expressAsyncHandler(auth), mimeTypeCheck, upload, expressAsyncHandler(async (req, res) => {
    if (res.locals.collectionType == 'private') {
        if (req.body.user) {
            req.body.user = req.query.userIdForRoleType
        }
    }
    await assert(res.locals?.canAccessAdmin, `${req?.collection} validation failed: token: unAuthorization`);
    const user = await User.create(req.body);
    await res.send(user);
}));
userRoute.get('/', collectionSet, setSelectStatement, expressAsyncHandler(auth), sortSet, searchSet, expressAsyncHandler(async (req, res) => {
    if (req.query.roleType == 'private' && req.search) {
        req.search.user = req.query.userIdForRoleType
    }
    await assert(res?.locals?.canAccessAdmin, `${req?.collection} validation failed: token: unAuthorization`);
    let level = {
        [res.locals.roleLevelType]: res.locals.roleLevel
    }

    if(req?.query?.patient){
        level = 3
    }
    const accessRoles = (await Role?.find({
        $or:[{level:level}]
        
    }))?.map(bUsers => bUsers?._id?.toString());
    if(req?.search?.role){
        req.search.role = typeof req.search.role == 'string' ? [req.search.role] : req.search.role;
        req.search.role = req.search.role?.filter( sRole => accessRoles?.includes(sRole));
    } else {
        req.search.role = accessRoles;
    }
    if(req.query.userRoleType == 'doctor' || res.locals.userRoleType == 'doctor'){
        req.search.doctor = req.query.userIdForRoleType || res.locals.userId;
    }
console.log("req.search",req.search)
    const users = await User.find(req.search)
    .populate('role', req.query["select-role"])
    .populate('doctor', req.query["select-doctor"])
    .select(req.select).skip(((req.query.page || 1) - 1) * (req.query.limit || 10)).limit(Number(req.query.limit || 10)).sort(req.sortSattment);
    const usersCount = await User.find(req.search).select(req.select).countDocuments();
    const usersTableCount = await User.find().countDocuments();
    res.send({
        data: users,
        totalCount: usersCount,
        tableCount: usersTableCount,
        page: (req.query.page || 1),
        limit: (req.query.limit || 10)
    });
}));
userRoute.get('/:_id', collectionSet, setSelectStatement, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
    if (req.query.roleType == 'private') {
        req.params.user = req.query.userIdForRoleType
    }
    const user = await User.findOne(req.params)
    .populate('role', req.query["select-role"])
    .populate('doctor', req.query["select-doctor"])
    .select(req.select);
    assert(user != null, `collection validation failed: item: notFound`);
    res.send(user);
}));
userRoute.delete('/:_id', uploadValidationsSet, collectionSet, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
    if (res.locals.collectionType == 'private') {
        req.params.user = req.query.userIdForRoleType
    }
    await assert(res.locals.canAccessAdmin, `${req?.collection} validation failed: token: unAuthorization`);

    const userForFile = await User.findOne(req.params);
    assert(userForFile != null, `collection validation failed: item: notFound`);
    deleteUploaded(userForFile, req);
    const user = await User.findOneAndDelete(req.params);
    res.send(user);
}));
userRoute.put('/:_id', fieldsTypeSet, emailCheck, passwordHash, uploadValidationsSet, collectionSet, expressAsyncHandler(auth), mimeTypeCheck, upload, expressAsyncHandler(async (req, res) => {
    if (res.locals.collectionType == 'private') {
        req.params.user = req.query.userIdForRoleType
    }

    const userForFile = await User.findOne(req.params);
    assert(userForFile != null, `collection validation failed: item: notFound`);
    deleteUploadedWhenEdit(userForFile, req);
    req.body.updatedAt = new Date();
    const user = await User.findOneAndUpdate(req.params, req.body);
    const userSend = await User.findOne(req.params);
    res.send(userSend);
}));
module.exports = userRoute;