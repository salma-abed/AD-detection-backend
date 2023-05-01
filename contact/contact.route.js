                const express = require('express');
                const assert = require('assert');
                const contactRoute = express.Router();
                const expressAsyncHandler = require('express-async-handler');
                const Contact = require('./contact.model');
                const auth = require('../function').auth;
                const setSelectStatement = require('../function').setSelectStatement;
                const sortSet = require('../function').sortSet
                const collectionSet = require('./contact.function').collectionSet
                const searchSet = require('./contact.function').searchSet
                const fieldsTypeSet = require('./contact.function').fieldsTypeSet
                const emailCheck = require('../function').emailCheck;
                const mimeTypeCheck = require('../function').mimeTypeCheck
                const upload = require('../function').upload
                const deleteUploadedWhenEdit = require('../function').deleteUploadedWhenEdit
                const deleteUploaded = require('../function').deleteUploaded
                const uploadValidationsSet = require('./contact.function').uploadValidationsSet
                contactRoute.post('/', fieldsTypeSet, emailCheck, uploadValidationsSet, collectionSet, expressAsyncHandler(auth), mimeTypeCheck, upload, expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        if (req.body.user) {
                            req.body.user = req.query.userIdForRoleType
                        }
                    }
                    const contact = await Contact.create(req.body);
                    await res.send(contact)
                }));
                contactRoute.get('/', collectionSet, setSelectStatement, expressAsyncHandler(auth), sortSet, searchSet, expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private' && req.search) {
                        req.search.user = req.query.userIdForRoleType
                    }
                    const contacts = await Contact.find(req.search).select(req.select).skip(((req.query.page || 1) - 1) * (req.query.limit || 10)).limit(Number(req.query.limit || 10)).sort(req.sortSattment);
                    const contactsCount = await Contact.find(req.search).select(req.select).countDocuments();
                    const contactsTableCount = await Contact.find().countDocuments();
                    res.send({
                        data: contacts,
                        totalCount: contactsCount,
                        tableCount: contactsTableCount,
                        page:  Number(req.query.page || 1),
                        limit: Number(req.query.limit || 10)
                    });
                }));
                contactRoute.get('/:_id', collectionSet, setSelectStatement, expressAsyncHandler(auth), expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        req.params.user = req.query.userIdForRoleType
                    }
                    const contact = await Contact.findOne(req.params).select(req.select);
                    assert(contact != null, `collection validation failed: item:  notFound`);
                    res.send(contact);
                }));

                contactRoute.put('/:_id', fieldsTypeSet, emailCheck, uploadValidationsSet, collectionSet, expressAsyncHandler(auth), mimeTypeCheck, upload, expressAsyncHandler(async (req, res) => {
                    if (res.locals.collectionType == 'private') {
                        req.params.user = req.query.userIdForRoleType
                    }
                    const contactForFile = await Contact.findOne(req.params);
                    assert(contactForFile != null, `collection validation failed: item:  notFound`);
                    deleteUploadedWhenEdit(contactForFile, req)
                    req.body.updatedAt = new Date();
                    const contact = await Contact.findOneAndUpdate(req.params, req.body);
                    const contactSend = await Contact.findOne(req.params);
                    res.send(contactSend);
                }));
                module.exports = contactRoute;