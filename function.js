

const bcrypt = require('bcryptjs');
const assert = require('assert');
const fs = require('fs');
const Role = require('./role/role.model');
const User = require('./user/user.model');
const jwt = require('jsonwebtoken');
require('dotenv').config();

async function auth(req, res, next) {
    var collection = req.collection;
    var token = req.headers.authorization ? req.headers.authorization.split(" ")[1] : undefined;
    var method = req.method.toLowerCase();
    let user;
    if (token) {
        user = await jwt.verify(token, 'seacret-key#1234567894121324874123154gjdfjagkdfhghdsgsahgfsdafgfaghjkfdsgjsk');
    }
    const roles = await Role.find();
    let userRole;
    if (user?.role) {
        userRole = await Role.findOne({
            _id: user.role
        });
    }
    let public = null;
    if (roles.length) {
        public = await Role.findOne({
            type: 'public'
        });
        if (public == null && !token) {
            await assert(token, `${collection} validation failed: token: unAuthorization`);
        } else if (public == null && token) {
            await assert(user && userRole && userRole.type, `${collection} validation failed: token: unAuthorization`);

            await assert(userRole != null, `${collection} validation failed: token: unAuthorization`);
            await assert(userRole.collections && userRole.collections[collection] && userRole.collections[collection].methods && userRole.collections[collection].methods[method], `${collection} validation failed: token: unAuthorization`);

            req.body.user = user._id;
            req.query.userIdForRoleType = user._id;
            res.locals.collectionType = userRole.collections[collection]['collection-type'];
            req.query.userRoleType = userRole.type;
            res.locals.canAccessAdmin = userRole?.adminPanel;
            res.locals.roleLevel = userRole?.level;
            res.locals.roleLevelType = userRole?.levelType;

        } else {
            await assert(public.collections && public.collections[collection] && public.collections[collection].methods, `${collection} validation failed: token: unAuthorization`);
            if (public.collections[collection].methods[method] == false) {
                assert(token, `${collection} validation failed: token: unAuthorization`);
                await assert(user && userRole && userRole.collections && userRole.collections[collection] && userRole.collections[collection].methods && userRole.collections[collection].methods[method], `${collection} validation failed: token: unAuthorization`);

                req.body.user = user._id;
                req.query.userIdForRoleType = user._id;
                res.locals.collectionType = userRole.collections[collection]['collection-type'];
                req.query.userRoleType = userRole.type;
            }


        }
    }
    res.locals.canAccessAdmin = userRole?.adminPanel || public?.adminPanel;
    res.locals.roleLevel = userRole?.level || public?.level;
    res.locals.roleLevelType = userRole?.levelType || public?.levelType;

    if (user?._id) {
        let userProfile = await User?.findById(user?._id);
        assert(userProfile != null, `collection validation failed: token: unAuthorization`)
        assert(userProfile?.status, `collection validation failed: token: unAuthorization`)
        res.locals.userId = user?._id;
        res.locals.userRole = userRole.type;
        res.locals.userRoleType = userRole.type;
        res.locals.wallet = userProfile?.wallet;
        res.locals.holdWallet = userProfile?.holdWallet;
        res.locals.collectionType = userRole?.collections[collection]['collection-type'];
        let enumStatusCollections = ['request', 'trip', 'requestTransactions', 'walletTransactions']
        if (method == 'get' && !res.locals.canAccessAdmin) {
            if (!enumStatusCollections?.includes(collection)) {
                req.query.status = true;
            }
        }
    } else {
        let enumStatusCollections = ['request', 'trip', 'requestTransactions', 'walletTransactions']
        if (method == 'get' && !res.locals.canAccessAdmin) {
            if (!enumStatusCollections?.includes(collection)) {
                req.query.status = true;
            }
        }
    }
    return next();
}

function mimeTypeCheck(req, res, next) {
    if (req.files && req.uploadValidation) {
        var keysCount = 0;
        for (key in req.files) {
            ++keysCount
            var el = req.uploadValidation[key];
            if (el) {
                var data = req.files[el.field];
                if (el.type == 'multi') {
                    if (Array.isArray(data) == false) {

                        data = [data]
                    }

                    assert(Array.isArray(data), `${el.folder} validation failed: ${el.field}: ${el.field} must be upload multi ${el.mimetype}`)
                } else {

                    assert(!Array.isArray(data) && typeof data == 'object', `${el.folder} validation failed: ${el.field}: ${el.field} must be upload single ${el.mimetype}`)
                }
                if (el.type == 'single') {

                    var fileMimeType = data.mimetype.split("/")[0];
                    assert(el.mimetype.indexOf(fileMimeType) != -1, `${el.folder} validation failed: ${el.field}: ${el.field} must be upload multi ${el.mimetype}`);

                } else {

                    data.forEach((file, index) => {
                        if (!file.src) {
                            var fileMimeType = file.mimetype.split("/")[0];
                            assert(el.mimetype.indexOf(fileMimeType) != -1, `${el.folder} validation failed: ${el.field}: ${el.field} must be upload only ${el.mimetype}`)
                        }
                    });
                };
                if (keysCount === Object.keys(req.files).length) {
                    return next()
                }
            } else {
                return next()
            }

        }

    }
    else {
        return next()
    }

}


async function upload(req, res, next) {
    if (req.files && req.uploadValidation) {
        var keysCount = 0;
        for (key in req.files) {
            ++keysCount
            var el = req.uploadValidation[key];
            if (el) {
                var data = req.files[el.field];
                if (el.type == 'single' && Array.isArray(data) == true) {
                    data = req.files[el.field][0];
                }
                if (el.type == 'multi' && Array.isArray(data) != true) {
                    data = [req.files[el.field]];
                }
                if (el.type == 'single') {
                    var newName = Date.now() + el.field + '-file.' + data.name.split('.')[data.name.split('.').length - 1];
                    var uploadPath = 'public/upload/' + el.folder + '/' + newName;
                    await data.mv(uploadPath, async function (err) {
                        if (err?.message?.includes('no such file or directory')) {
                            fs.mkdirSync('./public/upload/' + el.folder, (err) => {
                                assert(!err, err);
                                data.mv(uploadPath, async function (err) {
                                    await assert(!err, err);
                                })
                            });

                        } else {
                            await assert(!err, err);
                        }

                    });

                    req.body[el.field] = {
                        src: process.env.FILES_URL + '/upload/' + el.folder + '/' + newName,
                        mimetype: data.mimetype.split("/")[0]
                    }
                    req.files[el.field].newName = process.env.FILES_URL + '/upload/' + el.folder + '/' + newName;

                } else {
                    req.body[el.field] = typeof req.body[el.field] == 'string' ? JSON.parse(req.body[el.field]) : req.body[el.field]
                    data.forEach((file, index) => {
                        var newName = Date.now() + index + el.field + '-file.' + file.name.split('.')[file.name.split('.').length - 1];
                        var uploadPath = 'public/upload/' + el.folder + '/' + newName;
                        file.mv(uploadPath, async function (err) {
                            if (err?.message?.includes('no such file or directory')) {
                                fs.mkdirSync('./public/upload/' + el.folder, (err) => {
                                    assert(!err, err);
                                    file.mv(uploadPath, async function (err) {
                                        await assert(!err, err);
                                    })
                                });
                            } else {
                                await assert(!err, err);
                            }

                        });

                        if (req.body[el.field] && Array.isArray(req.body[el.field]) == false) {

                            req.body[el.field] = [req.body[el.field]]
                        }
                        req.body[el.field] = (req.body[el.field] || []).concat({
                            src: process.env.FILES_URL + '/upload/' + el.folder + '/' + newName,
                            mimetype: file.mimetype.split("/")[0]
                        })
                        req.files[el.field] = Array.isArray(req.files[el.field]) ? req.files[el.field] : [req.files[el.field]]
                        req.files[el.field][index].newName = process.env.FILES_URL + '/upload/' + el.folder + '/' + newName;

                    });
                };
                if (keysCount === Object.keys(req.files).length) {
                    return next()
                }
            } else {
                return next()
            }

        }

    }
    else {
        for (key in req.uploadValidation) {
            if (typeof req.body[key] != 'undefined') {
                req.body[key] = req?.body[key] == "undefined" || req?.body[key] == "null" ? null : req?.body[key];
            }
        }
        return next()
    }

}


function deleteUploadedWhenEdit(input, req) {
    var el = req.uploadValidation[key];
    req.body[req.uploadValidation[key].field] = typeof req.body[req.uploadValidation[key].field] == 'string' && req.body[req.uploadValidation[key].field] != 'null' && req.body[req.uploadValidation[key].field] != 'undefined' ? JSON.parse(req.body[req.uploadValidation[key].field]) : req.body[req.uploadValidation[key].field] === undefined ? input[req.uploadValidation[key].field] : req.body[req.uploadValidation[key].field];
    req.body[req.uploadValidation[key].field + '-old'] = typeof req.body[req.uploadValidation[key].field + '-old'] == 'string' && req.body[req.uploadValidation[key].field + '-old'] != 'null' && req.body[req.uploadValidation[key].field + '-old'] != 'undefined' ? JSON.parse(req.body[req.uploadValidation[key].field + '-old']) : req.body[req.uploadValidation[key].field + '-old'];
    if (el?.type == 'single') {
        req.body[req.uploadValidation[key].field] = req.body[req.uploadValidation[key].field] || req.body[req.uploadValidation[key].field + '-old'];
    } else {
        req.body[req.uploadValidation[key].field] = [...(req.body[req.uploadValidation[key].field] || []), ...(req.body[req.uploadValidation[key].field + '-old']) || []];
    }
    if (input != null && input) {
        for (key in req.uploadValidation) {
            if ((req.files && req.files[req.uploadValidation[key].field]) || req.body[req.uploadValidation[key].field]) {
                req.body[req.uploadValidation[key].field] = typeof req.body[req.uploadValidation[key].field] == 'string' && req.body[req.uploadValidation[key].field] != 'null' && req.body[req.uploadValidation[key].field] != 'undefined' ? JSON.parse(req.body[req.uploadValidation[key].field]) : req.body[req.uploadValidation[key].field]
                var data = typeof input[req.uploadValidation[key].field] == 'string' && input[req.uploadValidation[key].field] != 'null' && input[req.uploadValidation[key].field] != 'undefined' ? JSON.parse(input[req.uploadValidation[key].field]) : input[req.uploadValidation[key].field];
                var resData = typeof req.body[req.uploadValidation[key].field] == 'string' && req.body[req.uploadValidation[key].field] != 'null' && req.body[req.uploadValidation[key].field] != 'undefined' ? JSON.parse(req.body[req.uploadValidation[key].field]) : req.body[req.uploadValidation[key].field];
                if (Array.isArray(data) == true) {

                    data.forEach((file, index) => {
                        if (resData) {
                            if (resData.map(res => { return res.src }).indexOf(file.src) == -1) {
                                if (file && file.src && fs.existsSync(file.src.replace(process.env.FILES_URL + "/", ''))) {
                                    fs.unlink(file.src.replace(process.env.FILES_URL, './public'), (err) => {
                                        assert(!err, err);
                                    });
                                }
                            }
                        } else {
                            if (file && file.src && fs.existsSync(file.src.replace(process.env.FILES_URL, './public'))) {
                                fs.unlink(file.src.replace(process.env.FILES_URL, './public'), (err) => {
                                    assert(!err, err);
                                });
                            }
                        }


                    })

                } else {
                    if (resData) {

                        if (data && data.src && data.src != resData.src && fs.existsSync(data.src.replace(process.env.FILES_URL, './public'))) {
                            fs.unlink(data.src.replace(process.env.FILES_URL, './public'), (err) => {
                                assert(!err, err);
                            });
                        }
                    } else {
                        if (data && data.src && fs.existsSync(data.src.replace(process.env.FILES_URL, './public'))) {
                            fs.unlink(data.src.replace(process.env.FILES_URL, './public'), (err) => {
                                assert(!err, err);
                            });
                            req.body[req.uploadValidation[key].field] = {};
                        }
                    }

                }
            } else if (req.body[req.uploadValidation[key].field] === null) {
                req.body[req.uploadValidation[key].field] = typeof req.body[req.uploadValidation[key].field] == 'string' && req.body[req.uploadValidation[key].field] != 'null' && req.body[req.uploadValidation[key].field] != 'undefined' ? JSON.parse(req.body[req.uploadValidation[key].field]) : req.body[req.uploadValidation[key].field]
                var data = typeof input[req.uploadValidation[key].field] == 'string' && input[req.uploadValidation[key].field] != 'null' && input[req.uploadValidation[key].field] != 'undefined' ? JSON.parse(input[req.uploadValidation[key].field]) : input[req.uploadValidation[key].field];
                if (Array.isArray(data) == true) {
                    data.forEach((file, index) => {
                        fs.unlink(file?.src.replace(process.env.FILES_URL, './public'), (err) => {
                            assert(!err, err);
                        });
                    })

                } else {
                    if (data) {
                        fs.unlink(data?.src.replace(process.env.FILES_URL, './public'), (err) => {
                            assert(!err, err);
                        });
                    }

                }
            }

        }
    }
}

function deleteUploaded(input, req) {
    if (input != null && input) {
        for (key in req.uploadValidation) {
            var data = input[req.uploadValidation[key].field];

            if (Array.isArray(data) == true) {
                data.forEach((file, index) => {
                    if (file && file.src && fs.existsSync(file.src.replace(process.env.FILES_URL, './public'))) {
                        fs.unlink(file.src.replace(process.env.FILES_URL, './public'), (err) => {
                            assert(!err, err);
                        });
                    }
                })

            } else {

                if (data && data.src && fs.existsSync(data.src.replace(process.env.FILES_URL, './public'))) {
                    fs.unlink(data.src.replace(process.env.FILES_URL, './public'), (err) => {
                        assert(!err, err);
                    });
                }
            }
        }
    }


}

function emailCheck(req, res, next) {

    var keyCount = 0;
    for (key in req.fieldsType) {
        ++keyCount
        if (req.fieldsType[key].type == 'email') {
            var email = req.body ? req.body[key] : '',
                field = key;

            if (email && email.length) {
                if (/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/.test(email)) {
                    assert(true, `collection validation failed: ${field}: ${field} invalid`)
                } else {
                    assert(false, `collection validation failed: ${field}: ${field} invalid`)
                }
            }

        }
        if (keyCount == Object.keys(req.fieldsType).length) {
            return next()
        }

    }
    return next()

}
function passwordHash(req, res, next) {
    var keyCount = 0;
    for (key in req.fieldsType) {
        ++keyCount
        if (req.fieldsType[key].type == 'password') {
            var password = req.body ? req.body[key] : '',
                field = key;

            if (password && password.length) {
                req.body[key] = bcrypt.hashSync(password, 8)
            }

        }

        if (keyCount == Object.keys(req.fieldsType).length) {
            return next()
        }

    }

}

function passwordCompare(password, hash) {
    return bcrypt.compareSync(password, hash)
}
function sortSet(req, res, next) {
    if (req.query.sort) {
        var assert = require('assert')
        assert(req.query.sort && req.query.sort.split(" ").every((val) => {
            return val.split(":").length == 2 && val.split(":")[1].length > 0
        }), 'Sort Syntax incorrect Must Be => val1:1 val2:1 ..... or you can set -1 instead of 1 ')
    }
    var sortSattment = JSON.parse(req.query.sort ? '{"' + req.query.sort.replace(/:/g, '":').replace(/ /g, ',"') + '}' : '{}');
    req.sortSattment = sortSattment
    return next();
}

function deleteUploadedOnError(reqBody) {
    if (reqBody) {

        for (let key in reqBody.files) {
            var files = reqBody.files[key];
            if (files && Array.isArray(files) == true) {
                var filesMap = files.map(file => { return file?.newName?.replace(process.env.FILES_URL + "/", "") });
                filesMap.forEach(file => {
                    if (file && fs.existsSync(file)) {
                        fs.unlink(file, (err) => {
                            assert(!err, err);
                        });
                    }
                })
            } else if (files && Array.isArray(files) != true && typeof files == 'object') {
                if (files && files.newName && fs.existsSync(files.newName.replace(process.env.FILES_URL, './public'))) {
                    fs.unlink(files.newName.replace(process.env.FILES_URL, './public'), (err) => {
                        assert(!err, err);
                    });
                }
            }
        }
    }



}

function setSelectStatement(req, res, next) {
    const select = req.query.select ? JSON.parse('{' + req.query.select.split(" ").map(field => {
        return '"' + field + '":1'
    }) + '}') : {};
    req.select = select;
    return next();
}

module.exports = {
    mimeTypeCheck,
    upload,
    deleteUploaded,
    deleteUploadedOnError,
    deleteUploadedWhenEdit,
    emailCheck,
    passwordHash,
    passwordCompare,
    auth,
    sortSet,
    setSelectStatement

}
