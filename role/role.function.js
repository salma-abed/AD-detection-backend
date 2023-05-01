function collectionSet(req, res, next) {
    req.collection = 'role';
    return next()
}

function uploadValidationsSet(req, res, next) {
    req.uploadValidation = {};
    return next()
}

function fieldsTypeSet(req, res, next) {
    req.fieldsType = {
        "title": {
            "type": 'multi_langauge'
        },
        "type": {
            "type": 'String'
        },
        "default": {
            "type": 'String'
        },
        "adminPanel": {
            "type": 'String'
        },
        "app": {
            "type": 'String'
        },
        "createdAt": {
            "type": 'Date'
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
        "title": req.query["title"],
        "type": req.query["type"],
        "default": req.query["default"],
        "adminPanel": req.query["adminPanel"],
        "app": req.query["app"],
        "createdAt": req.query["createdAt"],
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