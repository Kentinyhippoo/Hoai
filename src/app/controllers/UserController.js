const Dish = require('../models/Dish');
const User = require('../models/Userid');
const bcryt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
    mutiMongoosetoObject,
    MongoosetoObject,
} = require('../../util/subfuntion');

class UserController {
    index(req, res) {
        res.render('user/userinfo',{
            user: req.user,
        });
    }
    // [GET] /user/ordered
    ordered(req, res, next) {
        res.render('user/cart')
    }

    // [GET] /user/ordered
    payment(req, res, next) {
        res.render('user/onlPayment')
    }

    // [GET] /user/viewrevenue
    viewrevenue(req, res, next) {
        if (!req.query.page) req.query.page = 1;
        // res.json(req.session.email);
        Promise.all([
            Dish.find({})
                .limit(6)
                .skip((req.query.page - 1) * 6)
                .sortable(req),
            Dish.countDocumentsDeleted(),
            Dish.countDocuments(),
        ])
            .then(([dishes, deletedCount, count]) => {
                res.render('user/viewrevenue', {
                    dishes: mutiMongoosetoObject(dishes),
                    page: req.query.page,
                    user: req.user,
                    count,
                    deletedCount,
                });
            })
            .catch(next);
    }

    // [GET] /user/trash
    trash(req, res, next) {
        Dish.findDeleted({})
            .then((dishes) => {
                res.render('user/trash', {
                    dishes: mutiMongoosetoObject(dishes),
                });
            })
            .catch(next);
    }
    // [POST] /user/updateImage
    updateImage(req, res, next) {
        modifyRequestImage(req);
        User.updateOne(
            { _id: req.params.id },
            { $set: { image: req.body.image, imageType: req.body.imageType } },
        )
            .then(() => res.redirect('/'))
            .catch(next);
    }

    // [POST] /user/register
    register(req, res, next) {
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (user) {
                    res.render('register', {
                        resinfo: req.body,
                        massage: 'User existed',
                    });
                } else if (req.body.password != req.body.cfpassword) {
                    res.render('register', {
                        resinfo: req.body,
                        massage: 'Password not match',
                    });
                } else {
                    bcryt.hash(
                        req.body.password,
                        10,
                        function (err, hashedPass) {
                            if (err) return res.json(err);
                            let newuser = new User({
                                email: req.body.email,
                                password: hashedPass,
                                name: req.body.name,
                                gender: req.body.gender,
                                address: req.body.address,
                            });
                            newuser
                                .save()
                                .then(() => res.redirect('/loginpage'))
                                .catch((error) => {
                                    res.json({ message: error });
                                });
                        },
                    );
                }
            })
            .catch((error) => res.json({ message: error.message }));
    }

    // [POST] /user/login
    login(req, res, next) {
        User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user)
                    return res.render('site/loginpage', {
                        massage: 'Wrong user or password',
                    });
                const email = user.email;
                bcryt.compare(req.body.password, user.password)
                    .then((result) => {
                        if (!result)
                            return res.render('site/loginpage', {
                                massage: 'Wrong user or password',
                                name: req.body.email,
                            });
                        const token = jwt.sign(
                            { username: email },
                            process.env.ACCESS_TOKEN_SECRET,
                        );
                        req.headers.authorization = 'Bearer ' + token;
                        next();
                    })
                    .catch((error) => {
                        res.send({ massage: error });
                    });
            })
            .catch(next);
    }
    // [GET] /user/logout
    logout(req, res, next) {
        if (req.session) {
            // delete session object
            req.session.destroy(function (err) {
                if (err) {
                    return next(err);
                } else {
                    return res.redirect('/');
                }
            });
        }
    }
}

module.exports = new UserController();
