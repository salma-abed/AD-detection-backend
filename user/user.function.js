            function collectionSet(req, res, next) {
                req.collection = 'user';
                return next()
            }

            function uploadValidationsSet(req, res, next) {
                req.uploadValidation = {
                    "image": {
                        "type": 'single',
                        "field": 'image',
                        "data": req.file ? req.files["image"].replace(/,/g, '/') : '',
                        "mimetype": "image",
                        "folder": "user",
                    }
                };
                return next()
            }

            function fieldsTypeSet(req, res, next) {

                req.fieldsType = {
                    "image": {
                        "type": 'media'
                    },
                    "role": {
                        "type": 'ObjectId'
                    },
                    "email": {
                        "type": 'email'
                    },
                    "password": {
                        "type": 'password'
                    },
                    "name": {
                        "type": 'String'
                    },
                    "status": {
                        "type": 'Boolean'
                    },
                    "createdAt": {
                        "type": 'Date'
                    },
                    "updatedAt": {
                        "type": 'Date'
                    },
                    "phone": {
                        "type": 'String'
                    },
                };
                return next()
            }

            function searchSet(req, res, next) {
                var search = {
                    _id: req.query._id,
                    "image": req.query["image"],
                    "role": req.query["role"],
                    "email": req.query["email"],
                    "password": req.query["password"],
                    "name": {
                        $regex: req.query.name ? new RegExp(req.query.name, 'i') : ''
                    },
                    "status": req.query["status"],
                    "createdAt": req.query["createdAt"],
                    "updatedAt": req.query["updatedAt"],
                    "phone": req.query["phone"],
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