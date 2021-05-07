const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
//const mongoConnect = require('./util/database').mongoConnect;
//const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { listenerCount } = require('events');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

/*app.use((req, res, next) => {
  User.findById("60947956b893eb8bf3e04661")
    .then(user => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch(err => console.log(err));
});
*/
app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

/*mongoConnect(client => {
  console.log(client);
  app.listen(3000);
});*/
/*mongoConnect(() => {
  
  app.listen(3000);
});*/
mongoose
  .connect('mongodb+srv://heatherS:rzdW8iGaPSvM35rv@cluster0.3uz0q.mongodb.net/shop?retryWrites=true&w=majority')
  .then(result => {
    app.listen(3000);
  }).catch(err => {
    console.log(err);
  })
