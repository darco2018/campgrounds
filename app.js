const createError = require('http-errors');
const express = require('express');

const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

// authentication
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');

// custom files
const seedDb = require('./seeds');
// routes
const landingRouter = require('./routes/landing');
const campgroundsRouter = require('./routes/campgrounds');
const authRouter = require('./routes/auth');
const commentsRouter = require('./routes/comments');

/* ---------- VIEW ENGINE -------------*/

app.set('views', path.join(__dirname, 'views')); //__dirname = workspace
app.set('view engine', 'ejs');

/* ---------- CREATE DB CONNECTION -------------*/

const dbName = 'express_camp';
mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', () => {
  console.log(`-------- Successfully connected to ${dbName} -------`);
});

/* ---------- MIDDLEWARE-------------*/

app.use(logger('dev'));
// express.json & express.urlencoded are only needed for POST & PUT
app.use(express.json());
app.use(cookieParser());
// express.urlencoded true recognizes incoming Request Object as string or array or rich object
// but fails to interprete ? correctly
app.use(express.urlencoded({ extended: true })); // // for application/x-www-form-urlencoded
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

/* ---------- SEED DB -------------*/

// seedDb();

/* ---------- PASSWORD CONFIG -------------*/

app.use(
  require('express-session')({
    secret: 'I am a cool coder',
    resave: false,
    saveUnitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  // whatever available in locals is available in each template
  res.locals.currentUser = req.user;
  next(); // will stop without it!
});

/* ---------- ROUTERS -------------*/

app.use('/', landingRouter);
app.use('/auth', authRouter);
app.use('/campgrounds', campgroundsRouter);
app.use('/campgrounds/:id/comments', commentsRouter);

/* ---------- ERROR HANDLING -------------*/

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app; // export used in bin/www
