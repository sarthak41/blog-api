const { verify } = require("jsonwebtoken");
const Post = require("../models/post");

const { body, validationResult } = require("express-validator");

exports.post_list = (req, res, next) => {
  Post.find({ public: true })
    .sort({ timestamp: -1 })
    .populate("author", "username")
    .populate("comments")
    .exec((err, posts) => {
      if (err) return next(err);
      return res.json(posts);
    });
};

exports.blogpost_get = (req, res, next) => {
  Post.findById(req.params.id)
    .populate("author", "username")
    .populate("comments")
    .exec((err, post) => {
      if (err) return res.json({ msg: "Couldn't load post" });

      return res.json(post);
    });
};

exports.create_blog_post = [
  (req, res, next) => {
    if (req.user.username !== "phantom")
      return res
        .status(403)
        .json({ msg: "Sorry, users aren't allowed to post" });

    next();
  },

  body("title", "Title required")
    .trim()
    .isLength({ min: 1, max: 100 })
    .escape(),
  body("content", "Content required").trim().isLength({ min: 1 }).escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    console.log(req.user.id);

    if (!errors.isEmpty()) {
      next();
    } else {
      Post.create(
        {
          title: req.body.title,
          content: req.body.content,
          author: req.user.id,
          comments: [],
          public: req.body.public,
          timestamp: new Date(),
        },
        (err, blog) => {
          if (err) return res.json(err);

          blog.populate("author", "username", (err, populatedBlog) => {
            if (err) return res.json(err);

            return res.json(populatedBlog);
          });
        }
      );
    }
  },
];

exports.makePublic = [
  (req, res, next) => {
    if (req.user.username !== "phantom")
      return res
        .status(403)
        .json({ msg: "Sorry, users don't have permission to update" });

    next();
  },

  (req, res, next) => {
    Post.findOneAndUpdate(
      { _id: req.params.id },
      { public: true },
      (err, post) => {
        if (err) return next(err);

        res.redirect(`/blog/`);
      }
    );
  },
];

exports.makePrivate = [
  (req, res, next) => {
    if (req.user.username !== "phantom")
      return res
        .status(403)
        .json({ msg: "Sorry, users don't have permission to update" });

    next();
  },

  (req, res, next) => {
    Post.findOneAndUpdate(
      { _id: req.params.id },
      { public: false },
      { new: true },
      (err, post) => {
        if (err) return next(err);

        res.redirect(`/blog/`);
      }
    );
  },
];

exports.blogpost_delete = [
  (req, res, next) => {
    if (req.user.username !== "phantom")
      return res
        .status(403)
        .json({ msg: "Sorry, users don't have permission to update" });

    next();
  },

  (req, res, next) => {
    Post.findOneAndRemove({ _id: req.params.id }, (err, post) => {
      if (err) return next(err);

      res.redirect(`/blog/`);
    });
  },
];

exports.verifyToken = (req, res, next) => {
  // Get auth header value
  const bearerHeader = req.headers["authorization"];

  // Check if bearer is undefined
  if (typeof bearerHeader !== "undefined") {
    // Split at the space
    const bearer = bearerHeader.split(" ");
    // Get token from array
    const bearerToken = bearer[1];
    // Set the token
    verify(bearerToken, process.env.SECRET, (err, decodedToken) => {
      if (err) return res.status(403).json({ msg: "Invalid token" });
      req.user = decodedToken;
      next();
    });
  } else {
    // Forbidden
    return res.status(403).json({ msg: "forbidden" });
  }
};
