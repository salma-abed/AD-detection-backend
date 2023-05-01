            function collectionSet(req, res, next) {
                req.collection = 'contact';
                return next()
            }

            function uploadValidationsSet(req, res, next) {
                req.uploadValidation = {
                    "attach": {
                        "type": 'multi',
                        "field": 'attach',
                        "data": req.file ? req.files["attach"].replace(/,/g, '/') : '',
                        "mimetype": "video,audio,application,image",
                        "folder": "contact",
                    }
                };
                return next()
            }

            function fieldsTypeSet(req, res, next) {
                req.fieldsType = {
                    "message": {
                        "type": 'String'
                    },
                    "name": {
                        "type": 'string'
                    },
                    "email": {
                        "type": 'email'
                    },
                    "subject": {
                        "type": 'String'
                    },
                    "phone": {
                        "type": 'String'
                    },
                    "createdAt": {
                        "type": 'Date'
                    },
                    "updatedAt": {
                        "type": 'Date'
                    },
                    "fullName": {
                        "type": 'String'
                    },
                    "attach": {
                        "type": 'media'
                    }
                };
                return next()
            }

            function searchSet(req, res, next) {
                var search = {
                    _id: req.query._id,
                    "message": req.query["message"],
                    $or:[
                        {
                            "name": {
                                $regex: req.query.keyword ? new RegExp(req.query.keyword, 'i') : ''
                            },
                        },
                        {
                            "email": {
                                $regex: req.query.keyword ? new RegExp(req.query.keyword, 'i') : ''
                            },
                        },
                        {
                            "phone": {
                                $regex: req.query.keyword ? new RegExp(req.query.keyword, 'i') : ''
                            },
                        },
                        {
                            "subject": {
                                $regex: req.query.keyword ? new RegExp(req.query.keyword, 'i') : ''
                            },
                        },
                        {
                            "message": {
                                $regex: req.query.keyword ? new RegExp(req.query.keyword, 'i') : ''
                            },
                        },
                    ],
                    "createdAt": req.query["createdAt"],
                    "updatedAt": req.query["updatedAt"],
                    "type": req.query["type"],
                    "attach": req.query["attach"],
                };
                 for (let key in search) {
                    if (typeof search[key] == 'object') {
                        for (let key2 in search[key]) {
                                if (search[key][key2] == undefined || search[key][key2] == null || !search[key][key2]) {
                                    delete search[key][key2]
                                }
                            }
                            var objectLength = 0;
                            for (let key2 in search[key]) {
                                objectLength++
                            }
                            if (objectLength == 0) {
                                delete search[key]
                            }
                    } else {
                        if (search[key] == undefined || search[key] == null || !search[key]) {
                            delete search[key]
                        }
                    }
                }
                req.search = search;
                return next()
            }
            module.exports = {
                uploadValidationsSet: uploadValidationsSet,
                collectionSet: collectionSet,
                searchSet: searchSet,
                fieldsTypeSet: fieldsTypeSet,
            }