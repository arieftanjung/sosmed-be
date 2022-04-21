const { createJwtAccess, createJwtemail } = require("../lib/jwt");
const { registerService, loginService } = require("../services/authService");
const { dbCon } = require("../connection");
const nodemailer = require("nodemailer");
const path = require("path");
const myCache = require("../lib/cache");
const fs = require("fs");
const handlebars = require("handlebars");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "artayasmi@gmail.com",
    pass: "toefazuzupthekgc",
  },
  tls: {
    rejectUnauthorized: false,
  },
});

module.exports = {
  // register
  register: async (req, res) => {
    try {
      const { data: userData } = await registerService(req.body);
      let timecreated = new Date().getTime();
      const dataToken = {
        id: userData.id,
        username: userData.username,
        timecreated,
      };
      let success = myCache.set(userData.id, dataToken, 300);
      if (!success) {
        throw { message: "errorrr" };
      }

      //   buat token email verifikasi dan token untuk aksees
      const tokenAccess = createJwtAccess(dataToken);
      const tokenEmail = createJwtemail(dataToken);
      console.log(tokenEmail);
      const host =
        process.env.NODE_ENV === "production"
          ? "http://namadomainfe"
          : "http://localhost:3000";
      const Link = `${host}/verifikasi/${tokenEmail}`;
      let filepath = path.resolve(__dirname, "../template/emailTemplate.html");
      // ubah html jadi string pake fs.readfile
      let htmlString = fs.readFileSync(filepath, "utf-8");
      console.log(htmlString);
      const template = handlebars.compile(htmlString);
      const htmlToEmail = template({
        username: userData.username,
        Link,
      });

      transporter.sendMail({
        from: "TITIK.TEMU <artayasmi@gmail.com>",
        to: userData.email,
        // to: "arieftostos@gmail.com",
        subject: "verifikasi akun",
        html: htmlToEmail,
      });
      // kriim data user dna token akses lagi untuk login
      res.set("x-token-access", tokenAccess);
      return res.status(200).send(userData);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error.message || error });
    }
  },
  login: async (req, res) => {
    try {
      const { success, data: userData, message } = await loginService(req.body);

      const dataToken = {
        id: userData.id,
        username: userData.username,
      };
      //   buat token email verified dan token untuk aksees
      const tokenAccess = createJwtAccess(dataToken);
      res.set("x-token-access", tokenAccess);
      return res.status(200).send(userData);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error.message || error });
    }
  },
  accountVerifikasi: async (req, res) => {
    const { id } = req.user;
    let conn, sql;
    try {
      conn = await dbCon.promise().getConnection();
      await conn.beginTransaction();
      // untuk mengecek user sudah verified atau belum
      sql = `select id from users where id = ? and isVerified = 1`;
      let [userVerifed] = await conn.query(sql, [id]);
      console.log(req.user);
      if (userVerifed.length) {
        // user sudah verified
        throw { message: "sudah verifikasi tidak perlu di klik kembali" };
      }
      sql = `update users set ? where id = ?`;
      let updateData = {
        isVerified: 1,
      };
      await conn.query(sql, [updateData, id]);
      sql = `select id, username,isVerified, email from users where id = ?`;
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
  },
  sendMailVerifikasi: async (req, res) => {
    const { id, email, username } = req.body;
    try {
      // membuat sesuatu atau value yang unique
      let timecreated = new Date().getTime();
      const dataToken = {
        id: id,
        username: username,
        timecreated,
      };
      let berhasil = myCache.set(id, dataToken, 5 * 60);
      if (!berhasil) {
        throw { message: "error caching" };
      }
      const tokenEmail = createJwtemail(dataToken);
      // kirim email verifikasi
      const host =
        process.env.NODE_ENV === "production"
          ? "http://namadomainfe"
          : "http://localhost:3000";
      const Link = `${host}/verifikasi/${tokenEmail}`;
      // cari path email template
      let filepath = path.resolve(__dirname, "../template/emailTemplate.html");
      // ubah html jadi string pake fs.readfile
      let htmlString = fs.readFileSync(filepath, "utf-8");
      console.log(htmlString);
      const template = handlebars.compile(htmlString);
      const htmlToEmail = template({
        username: username,
        Link,
      });
      console.log(htmlString);
      await transporter.sendMail({
        from: "TITIK.TEMU <artayasmi@gmail.com>",
        to: email,
        subject: "verifikasi",
        html: htmlToEmail,
      });
      return res.status(200).send({ message: "berhasil" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error.message || error });
    }
  },
  keeplogin: async (req, res) => {
    const { id } = req.user;
    let conn, sql;
    try {
      conn = await dbCon.promise();
      sql = `select * from users where id = ?`;
      let [result] = await conn.query(sql, [id]);
      return res.status(200).send(result[0]);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ message: error.message || error });
    }
  },
};
