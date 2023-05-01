const express = require('express');
const assert = require('assert');
const roleRoute = express.Router();
const expressAsyncHandler = require('express-async-handler');
const Role = require('./role.model');
const auth = require('../function').auth;
const convertTZ = require('../function').convertTZ;
const setSelectStatement = require('../function').setSelectStatement;
const sortSet = require('../function').sortSet
const collectionSet = require('./role.function').collectionSet
const searchSet = require('./role.function').searchSet
const fieldsTypeSet = require('./role.function').fieldsTypeSet
roleRoute.post('/', fieldsTypeSet, collectionSet, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
    if (res.locals.collectionType == 'private') {
        if (req.body.user) {
            req.body.user = req.query.userIdForRoleType
        }
    }
    
    const role = await Role.create(req.body);
    await res.send(role)
}));
/**
  * @swagger
  * tags:
  *  name: role
  *  description: Api For role
  * /role:
  *  get:
  *    tags: [role]
  *    security:
  *     - bearerAuth: []
  *    parameters:
  *     - in: query
  *       name: select
  *       schema:
  *         type: string
  *       required: false
  *       default: title type
  *       description: select keys from database key1 key2 key3
  *     - in: query
  *       name: app
  *       schema:
  *         type: string
  *         enums: [driver-app,client-app,service-provider-app]
  *       required: false
  *       default: driver-app
  *       description: driver-app || client-app || service-provider-app
  *    responses:
  *      '200':
  *        description: Created
  *        content:
  *           application/json:
  *             properties:
  *               data:
  *                  type: array
  *               totalCount:
  *                  type: integer
  *               tableCount:
  *                  type: integer
  *               page:
  *                  type: integer
  *               limit:
  *                  type: integer
  *                
  *      default:
  *        description: Created
  */
 roleRoute.get('/', collectionSet, setSelectStatement, expressAsyncHandler(auth), sortSet, searchSet, expressAsyncHandler(async (req, res) => {
    if (req.query.roleType == 'private' && req.search) {
        req.search.user = req.query.userIdForRoleType
    }
    console.log("res.locals",res.locals)
    let level = {
        [res.locals.roleLevelType]: res.locals.roleLevel
    }
    req.search.level = level; 
    const roles = await Role.find(req.search).select(req.select).skip(((req.query.page || 1) - 1) * (req.query.limit || 10)).limit(Number(req.query.limit || 10)).sort(req.sortSattment);
    const rolesCount = await Role.find(req.search).select(req.select).countDocuments();
    const rolesTableCount = await Role.find().countDocuments();
    res.send({
        data: roles,
        totalCount: rolesCount,
        tableCount: rolesTableCount,
        page: (req.query.page || 1),
        limit: (req.query.limit || 10)
    });
}));
roleRoute.get('/:_id', collectionSet, setSelectStatement, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
    if (req.query.roleType == 'private') {
        req.params.user = req.query.userIdForRoleType
    }
    const role = await Role.findOne(req.params).select(req.select);
    assert(role != null, `collection validation failed: item:  notFound`);
    res.send(role);
}));
roleRoute.delete('/:_id', collectionSet, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
    if (res.locals.collectionType == 'private') {
        req.params.user = req.query.userIdForRoleType
    }
    const roleForFile = await Role.findOne(req.params);
    assert(roleForFile != null, `collection validation failed: item:  notFound`);
    const role = await Role.findOneAndDelete(req.params);
    res.send(role);
}));
roleRoute.put('/:_id', fieldsTypeSet, collectionSet, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
    if (res.locals.collectionType == 'private') {
        req.params.user = req.query.userIdForRoleType
    }
    const roleForFile = await Role.findOne(req.params);
    assert(roleForFile != null, `collection validation failed: item:  notFound`);
    req.body.updatedAt = new Date();
    const role = await Role.findOneAndUpdate(req.params, req.body);
    const roleSend = await Role.findOne(req.params);
    res.send(roleSend);
}));
module.exports = roleRoute;