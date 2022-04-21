const { dbCon } = require("./../connection");
// encrypsi by crypto
const crypto = require("crypto");

const hashPass = (password) => {
  let hashing = crypto
    .createHmac("sha256", "puripuriprisoner")
    .update(password)
    .digest("hex");
  return hashing;
};

module.exports = {
  loginService: async (data) => {
    let { username, email, password } = data;
    let conn, sql;

    try {
      // connection in pool
      conn = await dbCon.promise().getConnection();
      //  hashing password
      password = hashPass(password);
      sql = `select * from users where (username = ? or email = ?) and password = ? `;
      let [result] = await conn.query(sql, [username, email, password]);
      console.log(result);
      if (!result.length) {
        // user is not defined
        // console.log("tes");
        throw { message: "user is not defined" };
      }
      // cek verified user
      if (!result[0].isVerified) {
        throw { message: "user belum terverified" };
      }
      conn.release();
      return { success: true, data: result[0] };
    } catch (error) {
      conn.release();
      console.log(error);
      throw new Error(error.message || error);
    }
  },
  registerService: async (data) => {
    let conn, sql;
    let { username, email, password, fullname } = data;
    try {
      // buat connection dari pool karena query lebih dari satu kali
      conn = await dbCon.promise().getConnection();
      // validasi spasi untuk username
      let spasi = new RegExp(/ /g);
      if (spasi.test(username)) {
        //   kalo ada spasi masuk sini
        throw { message: "tidak boleh ada spasi" };
      }
      await conn.beginTransaction();
      sql = `select id from users where username = ? or email =?`;

      let [result] = await conn.query(sql, [username, email]);
      if (result.length) {
        //    masuk sini berarti ada username atau email yang sama
        throw { message: "username atau email telah digunakan" };
      }
      sql = `INSERT INTO users set ?`;
      //   buat object baru
      let insertData = {
        username,
        email,
        fullname,
        password: hashPass(password),
      };

      let [result1] = await conn.query(sql, insertData);
      //   get data user lagi
      sql = `select id,username,email,fullname from users where id= ?`;
      let [userData] = await conn.query(sql, [result1.insertId]);
      await conn.commit();
      conn.release();
      return { success: true, data: userData[0] };
    } catch (error) {
      conn.rollback();
      conn.release();
      throw new Error(error.message || error);
    }
  },
};
