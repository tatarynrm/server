
const pool = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_URI,
  poolMax: Number(process.env.DB_POOL_MAX || 20),
  poolMin: Number(process.env.DB_POOL_MIN || 10),
  poolIncrement: Number(process.env.DB_POOL_INCREMENT || 1),
  poolTimeOut: Number(process.env.DB_POOL_TIMEOUT || 60),
};

module.exports = pool;

// const pool = {
//   user: "rt",
//   password: "Rt45Dcv2",
//   connectString: "localhost/ORCL",
// };
// const pool = {
//   user: "rt",
//   password: "Rt45Dcv2",
//   connectString:
//     "(DESCRIPTION=(ADDRESS=(PROTOCOL=TCP)(HOST=192.168.5.9)(PORT=1521))(CONNECT_DATA=(SERVER=DEDICATED)(SERVICE_NAME=ict)))",
// };
