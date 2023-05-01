            function collectionSet(req, res, next) {
                req.collection = 'report';
                return next()
            }

            function uploadValidationsSet(req, res, next) {
                req.uploadValidation = {
                    "file": {
                        "type": 'single',
                        "field": 'file',
                        "data": req.file ? req.files["file"].replace(/,/g, '/') : '',
                        "mimetype": "video,audio,application,image",
                        "folder": "report",
                    }
                };
                return next()
            }

            function fieldsTypeSet(req, res, next) {
                req.fieldsType = {
                    "user": {
                        "type": 'ObjectId'
                    },
                    "patient": {
                        "type": 'ObjectId'
                    },
                    "createdAt": {
                        "type": 'Date'
                    },
                    "updatedAt": {
                        "type": 'Date'
                    },
                    "image": {
                        "type": 'media'
                    }
                };
                return next()
            }

            function searchSet(req, res, next) {
                var search = {
                    _id: req.query._id,
                    "createdAt": req.query["createdAt"],
                    "updatedAt": req.query["updatedAt"],
                    "user": req.query["user"],
                    "patient": req.query["patient"],
                    "image": req.query["image"],
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