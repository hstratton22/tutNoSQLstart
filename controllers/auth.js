const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    //console.log(req.get('Cookie')//)
    const isLoggedIn = req
        .get('Cookie')
        .split(';')[0]
        .trim()
        .split('=')[1] === 'true';
    res.render('auth/login', {
        path: '/login',
        pageTitle: 'Login',
        isAuthenticated: isLoggedIn//req.isLoggedIn//
    });
};
exports.postLogin = (req, res, next) => {
    //req.isLoggedin = true;
    //res.setHeader('Set-Cookie', 'loggedIn=true; HttpOnly')


    User.findById('609583ea3f161a723a332044')//("60947956b893eb8bf3e04661")
        .then(user => {
            req.session.isLoggedIn = true;
            req.session.user = user;
            res.redirect('/');
            //next();
        })
        .catch(err => console.log(err));

    //res.redirect('/');
}
exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        res.redirect('/');
    });
}