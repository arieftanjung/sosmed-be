const { dbCon } = require("./../connection");
const fs = require("fs");

const updateProfile = async (req, res) => {
  const { fullname, bio, username } = req.body;
  const { id } = req.user;
  let conn, sql;
  try {
    conn = await dbCon.promise().getConnection();
    await conn.beginTransaction();
    sql = `select id from users where id = ? and isVerified = 1`;
    let [userVerfied] = await conn.query(sql, [id]);
    console.log(req.user);
    if (!userVerfied.length) {
      throw { message: "account is not verified" };
    }
    // untuk memeriksa username apakah sudah digunakan atau belum
    sql = `select id from users where username = ?`;
    let [usernameMatch] = await conn.query(sql, [username]);
    console.log(req.user);
    if (usernameMatch.length) {
      throw { message: "Username has already been used" };
    }
    sql = `update users set ? where id = ?`;
    let updateData = {
      fullname: fullname,
      bio: bio,
      username: username,
    };
    await conn.query(sql, [updateData, id]);
    sql = `select * from users where id = ?`;
    let [result] = await conn.query(sql, [id]);
    await conn.commit();
    conn.release();
    return res.status(200).send(result[0]);
  } catch (error) {
    conn.rollback();
    conn.release();
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

const addProfilePhoto = async (req, res) => {
  const { id } = req.user;
  console.log(req.file);
  let path = "/images";
  // simpan ke database '/books/book1648525218611.jpeg'
  const imagePath = req.file ? `${path}/${req.file.filename}` : null;
  console.log(imagePath);
  if (!imagePath) {
    return res.status(500).send({ message: "foto tidak ada" });
  }
  let conn, sql;
  try {
    conn = dbCon.promise();
    sql = `update users set ? where id = ?`;
    let updateData = {
      profilepicture: imagePath,
    };
    await conn.query(sql, [updateData, id]);
    sql = `select * from users`;
    return res.status(200).send({ message: "berhasil upload foto" });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: error.message || error });
  }
};

module.exports = {
  updateProfile,
  addProfilePhoto,
};
