const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const pool = require("../db/pool");

const {
  sendNewYearEmail,
  sendEmail,
} = require("../nodemailer/newYearNodemailer");
const norisdb = require("../db/noris/noris");
// const { sendBuhTransport } = require("../index");

const sendNewYearEmailFunction = async (req, res) => {
  const { text } = req.body;
  const connection = await oracledb.getConnection(pool);
  connection.currentSchema = "ICTDAT";
  try {
    console.log(text);

    const result = await connection.execute(`
    select a.kod as kod_kontakt,
           b.kod,
           a.kod_ur,
           c.drcode,
           a.nkontakt,
           a.prim,
           b.val,
           c.ntype,
           e.nur,
           e.perekmt,
           e.peradr,
           e.pernegabarit,
           f.nkraina,
           g.nobl
    from kontakt a
    left join kontaktval b on a.kod = b.kod_kontakt
    left join kontakttype c on b.kod_type = c.kod
    join ur e on a.kod_ur = e.kod
    left join kraina f on e.kod_kraina = f.kod
    left join obl g on e.kod_obl = g.kod
    where c.drcode = 'EMAIL' and
          exists (select * from zaylst u where (u.kod_zam = a.kod_ur or u.kod_per = a.kod_ur) and u.perevdat >= to_date('01.01.2023','dd.mm.yyyy'))
    `)
console.log(result.rows);


    const myEmails = [
      "lembergus@gmail.com",
      "rt@ict.lviv.ua",
      "ab@ict.lviv.ua",
      "ab.ict.lviv@gmail.com",
      "tatarynrm@gmail.com",
      "bolix@ex.ua",
    ];
    sendEmail('rt@ict.lviv.ua',text)
    function scheduleEmails() {
      // const emails = []; // Ваш масив із 4000 електронних адрес
      // const myEmails = [
      //   "lembergus@gmail.com",
      //   "rt@ict.lviv.ua",
      //   "ab@ict.lviv.ua",
      //   "ab.ict.lviv@gmail.com",
      //   "tatarynrm@gmail.com",
      //   "bolix@ex.ua",
      // ];
      const myEmails = [
        // "lembergus@gmail.com",
        // "rt@ict.lviv.ua",
        // 'ab@ict.lviv.ua',
        'tatarynrm@gmail.com',
        // 'ab@ict.lviv.ua',
        // 'romannoris007@gmail.com'
      ];
      const twenty_minutes_interval = 20 * 60 * 1000;
      let index = 0;
      const interval = setInterval(() => {
        // const batch = emails.slice(index, index + 100);
        const batch = myEmails.slice(index, index + 2);
  
        batch.forEach((email) => {
          console.log(`Надіслано привітання ${email}`);
          sendEmail(email,text);
          const newFeedBack =  norisdb.query(
            `
             INSERT INTO emails (email)
             values ('${email}')
             returning *
             `
          );
        });

        // index += 100;
        index += 2; 

        if (index >= myEmails.length) {
          clearInterval(interval); // Зупинити інтервал після відправлення всіх листів
          console.log('Усі листи відправлено');
        }
      }, 5000); // Відправляти кожні 10 хвилин
    }
    if (text) {
      scheduleEmails();
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  sendNewYearEmailFunction,
};
