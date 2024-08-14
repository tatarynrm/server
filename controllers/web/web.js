const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const cookieParser = require("cookie-parser");
// const pool = require("../db/index");

const jwt = require("jsonwebtoken");

const pool = require("../../db/pool");
const { norisdb, ictmainsite } = require("../../db/noris/noris");

const addWebGuestZap = async (req, res) => {
  const { name, tel, email, text } = req.body;

 
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `BEGIN
              ICTDAT.p_webguest.WebGuestZapAdd(:pGuestName,:pGuestTel,:pGuestEMail,:pZapTxt);
          END;`,
      {
        pGuestName: name,
        pGuestTel: tel || null,
        pGuestEMail: email || null,
        pZapTxt: text || null,
      }
    );
    console.log('RESULT',result);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

const recordVisit = async (req,res) => {
  const {page} = req.body;
  console.log(page);
  const client = await ictmainsite.connect();
  const todayDate = new Date();
  const year = todayDate.getFullYear();
  const month = String(todayDate.getMonth() + 1).padStart(2, "0"); // Місяці від 0 до 11
  const day = String(todayDate.getDate()).padStart(2, "0"); // Дні від 1 до 31
  const today = `${year}-${month}-${day}`;
  try {
    await client.query("BEGIN");

    // Перевіряємо, чи існує запис для сьогоднішньої дати
    const checkRes = await client.query(
      "SELECT counter FROM visitors WHERE date = $1 and page =$2",
      [today,page]
    );

    if (checkRes.rows.length > 0) {
      // Якщо запис існує, збільшуємо значення counter
      const updateRes = await client.query(
        `UPDATE visitors SET  counter = counter + 1 WHERE date = $1 and page = $2 RETURNING counter`,
        [today,page]
      );
      console.log("Updated counter:", updateRes.rows[0].counter);
    } else {
      // Якщо запису немає, створюємо новий запис

      const insertRes = await client.query(
        "INSERT INTO visitors (date, counter,page) VALUES ($1,1,$2) RETURNING counter",
        [today,page]
      );
      console.log("Inserted new counter:", insertRes.rows[0].counter);
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("Error recording visit:", e);
    throw e;
  } finally {
    client.release();
  }
};

const getVisitorsMonth = async (req,res)=>{
  const client = await ictmainsite.connect();
  try {
   const result = await client.query(`
    SELECT date, 
       array_agg(json_build_object('page', page, 'visits', counter)) AS page_visits
FROM visitors
WHERE date >= date_trunc('month', current_date) 
  AND date < date_trunc('month', current_date) + interval '1 month'
GROUP BY date
ORDER BY date
    `)


    res.status(200).json(result.rows)

  } catch (error) {
    console.log(error);
  }
}
const getVisitorsMonthGroup = async (req,res)=>{
  const client = await ictmainsite.connect();
  try {
   const result = await client.query(`
SELECT 
    month,
    SUM(total_visits) AS total_visits,
    array_agg(json_build_object('page', page, 'visits', total_visits)) AS page_visits
FROM (
    SELECT 
        date_trunc('month', date) AS month,
        page,
        SUM(counter) AS total_visits
    FROM visitors
    WHERE date >= date_trunc('month', current_date) 
      AND date < date_trunc('month', current_date) + interval '1 month'
    GROUP BY month, page
) AS subquery
GROUP BY month
ORDER BY month;
    `)   

    res.status(200).json(result.rows)

  } catch (error) {
    console.log(error);
  }
}
const selectAllWebGuestZap = async (req, res) => {


 
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.webguestzap`
    );
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.log(error);
  }
};



module.exports = {
  addWebGuestZap,
  recordVisit,
  getVisitorsMonth,
  getVisitorsMonthGroup,
  selectAllWebGuestZap
};
