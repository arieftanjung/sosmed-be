const express = require("express");
const { addProfilePhoto } = require("../controllers/profileControllers");
const Router = express.Router();
const { verifyTokenAccess } = require("../lib/verifyToken");
const upload = require("../lib/upload");

const uploader = upload("/images", "IMG").single("profilepicture");

Router.post("/updateimage", verifyTokenAccess, uploader, addProfilePhoto);

module.exports = Router;
