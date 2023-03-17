var createError = require("http-errors");
var express = require("express");
// var bodyParser = require("body-parser");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const JWTStrategy = require("passport-jwt").Strategy;
const extractJWT = require("passport-jwt").ExtractJwt;

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var blogRouter = require("./routes/blog");

const Comment = require("./models/comment");
const Post = require("./models/post");
const User = require("./models/user");

var app = express();
app.use(express.json());

// parse application/x-www-form-urlencoded
// parse application/json
// app.use(bodyParser.json());

const mongoose = require("mongoose");
require("dotenv").config();
mongoose.set("strictQuery", false);
const mongoDB = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@myatlasclusteredu.bwmdh9z.mongodb.net/blog-api?retryWrites=true&w=majority`;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

// app.use(bodyParser.urlencoded({ extended: false }));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

passport.use(
  new LocalStrategy((username, password, done) => {
    User.findOne({ username: username }, (err, user) => {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      bcrypt.compare(password, user.password, (err, res) => {
        if (res) {
          // passwords match
          return done(null, user);
        } else {
          // passwords don't match!
          return done(null, false, { message: "Incorrect password" });
        }
      });
    });
  })
);

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.SECRET,
    },
    (jwtPayload, done) => {
      return done(null, jwtPayload);
    }
  )
);

passport.serializeUser(function (user, done) {
  done(null, user._id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/blog", blogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
