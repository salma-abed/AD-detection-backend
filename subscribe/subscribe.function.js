            function collectionSet(req, res, next) {
                req.collection = 'subscribe';
                return next()
            }

            function uploadValidationsSet(req, res, next) {
                req.uploadValidation = {};
                return next()
            }

            function fieldsTypeSet(req, res, next) {
                req.fieldsType = {
                    "createdAt": {
                        "type": 'Date'
                    },
                    "email": {
                        "type": 'email'
                    },
                    "updatedAt": {
                        "type": 'Date'
                    },
                    "status": {
                        "type": 'Boolean'
                    }
                };
                return next()
            }

            function searchSet(req, res, next) {
                var search = {
                    _id: req.query._id,
                    "createdAt": req.query["createdAt"],
                    "name": {
                        $regex: req.query.name ? new RegExp(req.query.name, 'i') : ''
                    },
                    "email": {
                        $regex: req.query.email ? new RegExp(req.query.email, 'i') : ''
                    },
                    "updatedAt": req.query["updatedAt"],
                    "status": req.query["status"]
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