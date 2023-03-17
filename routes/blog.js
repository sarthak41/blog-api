const express = require("express");
const router = express.Router();

const postController = require("../controllers/postController");
const userController = require("../controllers/userController");
const commentController = require("../controllers/commentController");
const { verify } = require("jsonwebtoken");

router.get("/", postController.post_list);

router.post(
  "/create",
  postController.verifyToken,
  postController.create_blog_post
);

router.get("/post/:id", postController.blogpost_get);

router.post(
  "/post/:id/public",
  postController.verifyToken,
  postController.makePublic
);
router.post(
  "/post/:id/private",
  postController.verifyToken,
  postController.makePrivate
);

router.delete(
  "/post/:id",
  postController.verifyToken,
  postController.blogpost_delete
);

module.exports = router;
