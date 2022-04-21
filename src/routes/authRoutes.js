const express = require("express");
const { verifyTokenEmail, verifyTokenAccess } = require("../lib/verifyToken");
const verifyLastToken = require("../lib/verifylastToken");
const { authControllers } = require("../controllers");
const { keeplogin } = require("../controllers/authControllers");

const Router = express.Router();
const { register, login, accountVerifikasi, sendMailVerifikasi } =
  authControllers;

Router.post("/login", login);
Router.get("/keeplogin", verifyTokenAccess, keeplogin);
Router.get("/sendmail-verifikasi", sendMailVerifikasi);
Router.get("/verifikasi", verifyTokenEmail, verifyLastToken, accountVerifikasi);
Router.post("/register", register);
// Router.get("/keeplogin", verifyTokenAccess, keeplogin);
module.exports = Router;
