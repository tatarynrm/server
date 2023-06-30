const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// const pool = require("../db/index");
const pool = require("../db/pool");
const jwt = require("jsonwebtoken");

const mobileLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const connection = await oracledb.getConnection(pool);
    const user = await connection.execute(`SELECT
        a.KOD,
        a.PRIZV,
        a.IMJA,
        a.PIPFULL,
        a.ISDIR,
        a.PIP,
        a.CODE_SEX,
        b.DB_PASSWD,
        c.MAIL
    FROM
        ictdat.os a
    JOIN ictdat.us b ON
        a.kod = b.kod_os
    JOIN ICTDAT.OSMAIL c ON a.kod = c.KOD_OS
    WHERE
        a.ZVILDAT IS NULL
        AND c.mail = '${email}'
        AND b.DB_PASSWD = '${password}'
    ORDER BY
        a.pip ASC`);

    if (user.rows.length > 0) {
      res.status(200).json(user);
    }

    if (!user) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const connection = await oracledb.getConnection(pool);
    const user = await connection.execute(`SELECT
        a.KOD,
        a.PRIZV,
        a.IMJA,
        a.PIPFULL,
        a.ISDIR,
        a.PIP,
        a.CODE_SEX,
        b.DB_PASSWD,
        c.MAIL
    FROM
        ictdat.os a
    JOIN ictdat.us b ON
        a.kod = b.kod_os
    JOIN ICTDAT.OSMAIL c ON a.kod = c.KOD_OS
    WHERE
        a.ZVILDAT IS NULL
        AND c.mail = '${email}'
        AND b.DB_PASSWD = '${password}'
    ORDER BY
        a.pip ASC`);

    const token = jwt.sign(
      {
        id: user.rows[0].KOD,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );
    if (user.rows.length > 0) {
      console.log(token);
      res.status(200).json({ ...user, token: token });
    }
    if (!user) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }
    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Не вдалось авторизуватись",
    });
  }
};
const getMe = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const user = await connection.execute(`SELECT
    a.KOD,
    a.PRIZV,
    a.IMJA,
    a.PIPFULL,
    a.ISDIR,
    a.PIP,
    a.CODE_SEX,
    b.DB_PASSWD,
    c.MAIL,
    d.TEL
FROM
    ictdat.os a
JOIN ictdat.us b ON
    a.kod = b.kod_os
JOIN ICTDAT.OSMAIL c ON a.kod = c.KOD_OS
JOIN ICTDAT.OSTEL d ON a.kod = d.KOD_OS 
WHERE
    a.ZVILDAT IS NULL
    AND a.KOD = '${req.userId}'
    AND d.SL = 1
ORDER BY
    a.pip ASC`);

    res.status(200).json({ ...user.rows[0] });
    if (!user) {
      return res.status(404).json({
        message: "Користувача не знайдено",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Немає доступу",
    });
  }
};
module.exports = {
  login,
  getMe,
  mobileLogin,
};
