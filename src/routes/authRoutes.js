const express = require("express");
const Router = express.Router();
const { authControllers } = require("./../controllers");
const { verifyTokenAccess } = require("./../lib/verifyTokenAccess");
const { register } = authControllers;
const { login, keeplogin, sendEmailVerified, accountVerified } =
  authControllers;

Router.post("/login", login);

Router.post("/register", register);

module.exports = Router;
