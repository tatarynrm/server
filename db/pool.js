// const pool = {
//   user: "rt",
//   password: "Rt45Dcv2",
//   connectString:
//     "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.5.9)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=ict)))",
// };
const pool = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_URI,
};
// const pool = {
//   user: "rt",
//   password: "Rt45Dcv2",
//   connectString: "localhost/ORCL",
// };

module.exports = pool;
