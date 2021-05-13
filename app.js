const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);

const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;
const User = require('./models/user');

const MONGODB_URI = 'mongodb+srv://heatherS:rzdW8iGaPSvM35rv@cluster0.3uz0q.mongodb.net/shop';//?retryWrites=true&w=majority';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI, 
  collection: 'sessions'
});

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'my secret', 
  resave:false, 
  saveUninitialized: false,
  store: store
 })
);
/*
app.use((req, res, next) => {
  User.findById('609583ea3f161a723a332044')//("60947956b893eb8bf3e04661")
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});*/

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

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
    User.findOne().then(user =>{
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
    
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
