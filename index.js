require("dotenv").config();
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const morgan = require("morgan");
const { dbcon } = require("./src/connection");

app.use(express.json());

// cors
app.use(cors());
// parse from data berguna untuk upload file
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    exposedHeaders: ["x-total-count", "x-token-access"],
  })
);

app.get("/", (req, res) => {
  res.send("<h1>SOSIALMEDIA</h1>");
});

const { authRoutes } = require("./src/routes");
app.use("/auth", authRoutes);

app.listen(PORT, () => console.log(`app jalan di ${PORT}`));
