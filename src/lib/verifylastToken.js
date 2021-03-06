const myCache = require("./cache");
const verifyLastToken = (req, res, next) => {
  const { timecreated, id } = req.user;
  let isiCache = myCache.get(id);

  if (timecreated === isiCache.timecreated) {
    next();
  } else {
    return res.status(401).send({ message: "unauthorized" });
  }
};

module.exports = verifyLastToken;
