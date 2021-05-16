const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
//const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

//const transporter = nodemailer.createTransport(sendgridTransport( {
//     auth: {
//         api_key:
//     }
// }))
// ;
exports.getLogin = (req, res, next) => {
    //console.log(req.flash('error'));
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    //console.log(req.get('Cookie')//)
    /*const isLoggedIn = req
        .get('Cookie')
        .split(';')[0]
        .trim()
        .split('=')[1] === 'true';*/
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        errorMessage: message
        //isAuthenticated: false//isLoggedIn//req.isLoggedIn//false
    });
};
exports.getSignup = (req, res, next) => {
    //console.log(req.flash('error'));
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', {
        path: '/signup',
        pageTitle: 'Signup',
        errorMessage: message
        //isAuthenticated: false
    });
};
exports.postLogin = (req, res, next) => {
    //req.isLoggedin = true;
    //res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly')

    const email = req.body.email;
    const password = req.body.password;

    User.findOne({ email: email })//('609583ea3f161a723a332044')//("60947956b893eb8bf3e04661")
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password')
                return res.redirect('/login');
            }
            bcrypt
                .compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid email or password')
                    res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                });
        })
        //next();
        .catch(err => console.log(err));
};
exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    User.findOne({ email: email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'Email already exists. Pick a different one.')
                return res.redirect('/signup');
            }
            return bcrypt
                .hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: email,
                        password: hashedPassword,
                        cart: { items: [] }
                    });
                    return user.save();
                })
                .then(result => {
                    res.redirect('/login');
                });
        })
        .catch(err => {
            console.log(err);
        });
};
