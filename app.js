const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const PRIVATE = require('./private');
const multer = require('multer');

const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const MONGODB_URI = PRIVATE.dbURL;

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI, 
  collection: 'sessions'
});
const csrfProtection  = csrf();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
  cb(null, new Date().toISOString()  + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
  
}
app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({storage:fileStorage, fileFilter:fileFilter}).single('image'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(session({
  secret: 'my secret', 
  resave: false, 
  saveUninitialized: false,
  store: store
 })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  //throw new Error('Sync Dummy');
  if (!req.session.user){
    return next();
  }
  User.findById(req.session.user._id)//('609583ea3f161a723a332044')//("60947956b893eb8bf3e04661")
    .then(user => { 
      //throw new Error('Dummy!);
      if (!user) {
      return next();
    }
      req.user = user;
      next();
    })
    .catch(err => {
      //console.log(err));
      //next();
      //throw new Error(err);
      next(new Error(err));
    });
});


app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);//post?
app.use(errorController.get404);
app.use((err, req, res, next) => {
  //res.status(error.httpStatusCode).render(...);
  //res.redirect('500');
  res.status(500).render('500', { 
    pageTitle: 'Error Occurred', 
    path: '/500',
    isAuthenticated :  req.session.isLoggedIn 
  });
});

/*mongoConnect(client => {
  console.log(client);
  app.listen(3000);
});*/
/*mongoConnect(() => {
  
  app.listen(3000);
});*/
mongoose
  .connect(MONGODB_URI)
  .then(result => {
   /* User.findOne().then(user =>{
      if (!user){
        const user = new User({
          name: 'me',
          email: 'me@me.com',
          cart: {
            items: []
          }
        });
        user.save();
      }
    });
    */
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
