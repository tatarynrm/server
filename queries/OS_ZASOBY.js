// const GET_ALL_ZAS = `SELECT
// a.KOD,
// a.PRIZV,
// a.IMJA,
// a.PIPFULL,
// b.DB_PASSWD,
// c.MAIL,
// d.NOSZAS
// FROM
// ictdat.os a
// JOIN ictdat.us b ON
// a.kod = b.kod_os
// JOIN ICTDAT.OSMAIL c ON a.kod = c.KOD_OS
// JOIN ICTDAT.OSZAS d ON a.kod = d.KOD_OS
// WHERE a.kod = '${id}'
// ORDER BY
// a.pip ASC`;

// module.exports = {
//   GET_ALL_ZAS,
// };
