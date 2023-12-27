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


    // const myEmails = [
    //   "lembergus@gmail.com",
    //   "rt@ict.lviv.ua",
    //   "ab@ict.lviv.ua",
    //   "ab.ict.lviv@gmail.com",
    //   "tatarynrm@gmail.com",
    //   "bolix@ex.ua",
    // ];
    // sendEmail('rt@ict.lviv.ua',text)
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
      // const myEmails = [

      //   {
      //     KOD_KONTAKT: 147641,
      //     KOD: 594611,
      //     KOD_UR: 51011,
      //     DRCODE: 'EMAIL',
      //     NKONTAKT: 'Іван Йосипович',
      //     PRIM: 'логіст',
      //     VAL: 'rt@ict.lviv.ua',
      //     NTYPE: 'E-Mail',
      //     NUR: 'Луньо І.Й.',
      //     PEREKMT: null,
      //     PERADR: 0,
      //     PERNEGABARIT: 0,
      //     NKRAINA: 'Україна',
      //     NOBL: 'Львівська'
      //   },
      //   {
      //     KOD_KONTAKT: 147641,
      //     KOD: 594611,
      //     KOD_UR: 51011,
      //     DRCODE: 'EMAIL',
      //     NKONTAKT: 'Іван Йосипович',
      //     PRIM: 'менеджер',
      //     VAL: 'tatarynrm@gmail.com',
      //     NTYPE: 'E-Mail',
      //     NUR: 'NESTLE',
      //     PEREKMT: null,
      //     PERADR: 0,
      //     PERNEGABARIT: 0,
      //     NKRAINA: 'Україна',
      //     NOBL: 'Львівська'
      //   },
      //   {
      //     KOD_KONTAKT: 147641,
      //     KOD: 594611,
      //     KOD_UR: 51011,
      //     DRCODE: 'EMAIL',
      //     NKONTAKT: 'Іван Йосипович',
      //     PRIM: 'директор',
      //     VAL: 'lembergus@gmail.com',
      //     NTYPE: 'E-Mail',
      //     NUR: 'Транс-Логістик',
      //     PEREKMT: null,
      //     PERADR: 0,
      //     PERNEGABARIT: 0,
      //     NKRAINA: 'Україна',
      //     NOBL: 'Львівська'
      //   },
      //   {
      //     KOD_KONTAKT: 147641,
      //     KOD: 594611,
      //     KOD_UR: 51011,
      //     DRCODE: 'EMAIL',
      //     NKONTAKT: 'Іван Йосипович',
      //     PRIM: 'директор',
      //     VAL: 'ab@ict.lviv.ua',
      //     NTYPE: 'E-Mail',
      //     NUR: 'Баштовий В.С',
      //     PEREKMT: null,
      //     PERADR: 0,
      //     PERNEGABARIT: 0,
      //     NKRAINA: 'Україна',
      //     NOBL: 'Львівська'
      //   },

      // ];
      const twenty_minutes_interval = 5 * 60 * 1000;
      let index = 0;
      const interval = setInterval(() => {
        const batch = result.rows.slice(index, index + 10);
        // const batch = myEmails.slice(index, index + 2);
  
        batch.forEach((email) => {
          console.log(`Надіслано привітання ${email}`);
          sendEmail(email.VAL,text);
          const newFeedBack =  norisdb.query(
            `
             INSERT INTO emails (email,contact,position,company)
             values ('${email.VAL}','${email.NKONTAKT}','${email.PRIM}','${email.NUR}')
             returning *
             `
          );
        });

        index += 10;
        // index += 2; 

        if (index >= result.rows.length) {
          clearInterval(interval); // Зупинити інтервал після відправлення всіх листів
          console.log('Усі листи відправлено');
        }
      }, twenty_minutes_interval); // Відправляти кожні 20 хвилин
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
