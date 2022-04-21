require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const morgan = require("morgan");
const { dbCon } = require("./src/connection");
const multer = require("multer");
const logMiddleware = (req, res, next) => {
  console.log(req.method, req.url, new Date().toString());
  next();
};

app.use(logMiddleware);
// const myCache = require("./src/lib/cache");

app.use(express.json());

// cors
app.use(cors());
// parse from data berguna untuk upload file
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(
  cors({
    exposedHeaders: ["x-token-access"],
  })
);

app.get("/", (req, res) => {
  res.send("<h1>SOSIALMEDIA</h1>");
});

const { authRoutes } = require("./src/routes");
app.use("/auth", authRoutes);

const { profileRoutes } = require("./src/routes");
app.use("/profile", profileRoutes);

const { imageProfileRoutes } = require("./src/routes");
app.use("/images", imageProfileRoutes);

app.listen(PORT, () => console.log(`app jalan di ${PORT}`));
