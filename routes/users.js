var express = require("express");
var router = express.Router();

const userController = require("../controllers/userController");

/* GET users listing. */
router.get("/", userController.user_list);

router.post("/signup", userController.signUp);

router.post("/login", userController.login);

module.exports = router;
