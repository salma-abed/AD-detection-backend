                const express = require('express');
                const assert = require('assert');
                const subscribeRoute = express.Router();
                const expressAsyncHandler = require('express-async-handler');
                const Subscribe = require('./subscribe.model');
                const auth = require('../function').auth;
const convertTZ = require('../function').convertTZ;
                const setSelectStatement = require('../function').setSelectStatement;
                const sortSet = require('../function').sortSet
                const collectionSet = require('./subscribe.function').collectionSet
                const searchSet = require('./subscribe.function').searchSet
                const fieldsTypeSet = require('./subscribe.function').fieldsTypeSet
                const emailCheck = require('../function').emailCheck;
                subscribeRoute.post('/', fieldsTypeSet, emailCheck, collectionSet, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        if (req.body.user) {
                            req.body.user = req.query.userIdForRoleType
                        }
                    }
                    const subscribe = await Subscribe.create(req.body);
                    await res.send(subscribe)
                }));
                subscribeRoute.get('/', collectionSet, setSelectStatement, expressAsyncHandler(auth), sortSet, searchSet, expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private' && req.search) {
                        req.search.user = req.query.userIdForRoleType
                    }
                    const subscribes = await Subscribe.find(req.search).select(req.select).skip(((req.query.page || 1) - 1) * (req.query.limit || 10)).limit(Number(req.query.limit || 10)).sort(req.sortSattment);
                    const subscribesCount = await Subscribe.find(req.search).select(req.select).countDocuments();
                    const subscribesTableCount = await Subscribe.find().countDocuments();
                    res.send({
                        data: subscribes,
                        totalCount: subscribesCount,
                        tableCount: subscribesTableCount,
                        page:  Number(req.query.page || 1),
                        limit: Number(req.query.limit || 10)
                    });
                }));
                subscribeRoute.get('/:_id', collectionSet, setSelectStatement, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        req.params.user = req.query.userIdForRoleType
                    }
                    const subscribe = await Subscribe.findOne(req.params).select(req.select);
                    assert(subscribe != null, `collection validation failed: item:  notFound`);
                    res.send(subscribe);
                }));
                subscribeRoute.delete('/:_id', collectionSet, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        req.params.user = req.query.userIdForRoleType
                    }
                    const subscribeForFile = await Subscribe.findOne(req.params);
                    assert(subscribeForFile != null, `collection validation failed: item:  notFound`);
                    const subscribe = await Subscribe.findOneAndDelete(req.params);
                    res.send(subscribe);
                }));
                subscribeRoute.put('/:_id', fieldsTypeSet, emailCheck, collectionSet, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        req.params.user = req.query.userIdForRoleType
                    }
                    const subscribeForFile = await Subscribe.findOne(req.params);
                    assert(subscribeForFile != null, `collection validation failed: item:  notFound`);
                    req.body.updatedAt = new Date();
                    const subscribe = await Subscribe.findOneAndUpdate(req.params, req.body);
                    const subscribeSend = await Subscribe.findOne(req.params);
                    res.send(subscribeSend);
                }));
                module.exports = subscribeRoute;