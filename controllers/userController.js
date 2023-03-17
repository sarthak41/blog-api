const User = require("../models/user");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const { body, validationResult } = require("express-validator");

exports.user_list = (req, res, next) => {
  User.find({})
    .sort({ username: -1 })
    .exec((err, posts) => {
      if (err) return next(err);
      res.json(posts);
    });
};

exports.signUp = (req, res, next) => {
  const errors = validationResult(req);

  const username = req.body.username.trim();
  const password = req.body.password.trim();

  const user = new User({
    username,
  });

  bcrypt.hash(password, 10, (err, hashedPw) => {
    if (err) return next(err);
    user.set("password", hashedPw);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    } else {
      User.findOne({ username }).exec((err, found_user) => {
        if (err) return next(err);

        if (found_user) {
          return res.status(409).json({ message: "Username already exists" });
        } else {
          user.save((err) => {
            if (err) return next(err);
            jwt.sign(
              { id: user._id, username: user.username },
              process.env.SECRET,
              { expiresIn: "5m" },
              (err, token) => {
                if (err) return next(err);
                console.log("Signed up!");
                res.status(200).json({ user, token });
              }
            );
          });
        }
      });
    }
  });
};

// exports.login = (req, res, next) => {
//   passport.authenticate("local", { session: false }, (err, user) => {
//     if (err || !user) {
//       return res.status(400).json({
//         message: "Something is not right",
//         user: user,
//       });
//     }

//     req.login(user, { session: false }, (err) => {
//       if (err) {
//         res.send(err);
//       }

//       // generate a signed son web token with the contents of user object and return it in the response

//       const token = jwt.sign(user, "cats");
//       return res.json({ user, token });
//     });
//   })(req, res, next);
// };

exports.login = (req, res, next) => {
  passport.authenticate("local", { successRedirect: "/" }, (err, user) => {
    if (err || !user) {
      return res.status(401).json({
        message: "Incorrect Username or Password",
        user,
      });
    }
    jwt.sign(
      { id: user._id, username: user.username },
      process.env.SECRET,
      { expiresIn: "1d" },
      (err, token) => {
        if (err) return next(err);
        res.status(200).json({ user, token });
      }
    );
  })(req, res, next);
};
