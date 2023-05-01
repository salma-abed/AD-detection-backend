                const express = require('express');
                const assert = require('assert');
                const reportRoute = express.Router();
                const expressAsyncHandler = require('express-async-handler');
                const Report = require('./report.model');
                const User = require('../user/user.model');
                const auth = require('../function').auth;
                const setSelectStatement = require('../function').setSelectStatement;
                const sortSet = require('../function').sortSet
                const collectionSet = require('./report.function').collectionSet
                const searchSet = require('./report.function').searchSet
                const fieldsTypeSet = require('./report.function').fieldsTypeSet
                const emailCheck = require('../function').emailCheck;
                const mimeTypeCheck = require('../function').mimeTypeCheck
                const upload = require('../function').upload
                const deleteUploadedWhenEdit = require('../function').deleteUploadedWhenEdit
                const deleteUploaded = require('../function').deleteUploaded
                const uploadValidationsSet = require('./report.function').uploadValidationsSet
                reportRoute.post('/', fieldsTypeSet, emailCheck, uploadValidationsSet, collectionSet, expressAsyncHandler(auth), mimeTypeCheck, upload, expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        if (req.body.user) {
                            req.body.user = req.query.userIdForRoleType
                        }
                    }
                    if(req?.body?.patient){
                        let patient = await User?.findById(req?.body?.patient);
                        req.body.doctor = patient?.doctor;
                    }
                    const report = await Report.create(req.body);
                    await res.send(report)
                }));
                reportRoute.get('/', collectionSet, setSelectStatement, expressAsyncHandler(auth), sortSet, searchSet, expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private' && req.search) {
                        if(res?.locals?.userRole == "patient"){
                            delete req.search.user;
                            req.search.patient = res?.locals?.userId
                        } else {
                            req.search.user = res?.locals?.userId;
                        }
                    }
                    
                    if(req.query.userRoleType == 'doctor' || res.locals.userRoleType == 'doctor'){
                        req.search.doctor = req.query.userIdForRoleType || res.locals.userId;
                    }

                    const reports = await Report.find(req.search)
                    .populate('patient', req.query["select-patient"])
                    .select(req.select).skip(((req.query.page || 1) - 1) * (req.query.limit || 10)).limit(Number(req.query.limit || 10)).sort(req.sortSattment);
                    const reportsCount = await Report.find(req.search).select(req.select).countDocuments();
                    const reportsTableCount = await Report.find().countDocuments();
                    res.send({
                        data: reports,
                        totalCount: reportsCount,
                        tableCount: reportsTableCount,
                        page:  Number(req.query.page || 1),
                        limit: Number(req.query.limit || 10)
                    });
                }));
                reportRoute.get('/:_id', collectionSet, setSelectStatement, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        if(res?.locals?.userRole == "patient"){
                            delete req.params.user;
                            req.params.patient = res?.locals?.userId
                        } else {
                            req.params.user = res?.locals?.userId;
                        }
                    }
                    
                    const report = await Report.findOne(req.params)
                    .populate('patient', req.query["select-patient"]).select(req.select)
                    .populate('comments.from',{name:1});
                    assert(report != null, `collection validation failed: item:  notFound`);
                    res.send(report);
                }));
                reportRoute.delete('/:_id', collectionSet, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        if(res?.locals?.userRole == "patient"){
                            req.params.user = res?.locals?.userId;
                        } else {
                            delete req.params.user;
                            req.params.patient = res?.locals?.userId
                        }
                    }
                    const reportForFile = await Report.findOne(req.params);
                    assert(reportForFile != null, `collection validation failed: item:  notFound`);
                    const report = await Report.findOneAndDelete(req.params);
                    res.send(report);
                }));
                reportRoute.put('/:_id', fieldsTypeSet, emailCheck, uploadValidationsSet, collectionSet, expressAsyncHandler(auth), mimeTypeCheck, upload, expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        req.params.user = req.query.userIdForRoleType
                    }
                    const reportForFile = await Report.findOne(req.params);
                    assert(reportForFile != null, `collection validation failed: item:  notFound`);
                    deleteUploadedWhenEdit(reportForFile, req)
                    req.body.updatedAt = new Date();
                    const report = await Report.findOneAndUpdate(req.params, req.body);
                    const reportSend = await Report.findOne(req.params);
                    res.send(reportSend);
                }));
                reportRoute.put('/:_id/comment', fieldsTypeSet, emailCheck, uploadValidationsSet, collectionSet, expressAsyncHandler(auth), mimeTypeCheck, upload, expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        if(res?.locals?.userRole == "patient"){
                            delete req.params.user;
                            req.params.patient = res?.locals?.userId
                        } else {
                            req.params.user = req.query.userIdForRoleType;
                        }
                    }
                    console.log("req.body.comment",req.body.comment)
                    assert(req.body.comment, `collection validation failed: comment:  required`);
                    const reportForFile = await Report.findOne(req.params);
                    assert(reportForFile != null, `collection validation failed: item:  notFound`);
                    deleteUploadedWhenEdit(reportForFile, req)
                    req.body.updatedAt = new Date();
                    const report = await Report.findOneAndUpdate(req.params, {
                        $push:{
                            comments: {
                                from: req.query.userIdForRoleType || res.locals.userId,
                                userType: req.query.userRoleType || res.locals.userRoleType,
                                comment: req.body.comment
                            }
                        }
                    });
                    const reportSend = await Report.findOne(req.params).populate('comments.from',{name:1});
                    res.send(reportSend);
                }));
                module.exports = reportRoute;