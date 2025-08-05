// Контрагенти (Замовники/Перевізники)
const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
// const pool = require("../db/index");
const pool = require("../db/pool");
const {
  GET_ALL_USERS,
  GET_ALL_ACTIVE_USERS,
  GET_ALL_FIRED_USERS,
} = require("../queries/user");

const getAllСarriers = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.ur 
      WHERE ISPOSTACH = 1
      FETCH FIRST 100 ROWS ONLY`
    );
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};
const getAllCustomers = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.ur 
      WHERE ISCLIENT = 1
      FETCH FIRST 5 ROWS ONLY`
    );
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};
const getAllExpeditions = async (req, res) => {
  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(
      `select * from ictdat.ur 
      WHERE ISEXP = 1
      FETCH FIRST 5 ROWS ONLY`
    );
    res.status(200).json(result.rows);
    if (!result) {
      res.status(401).json({ message: "error" });
    }
  } catch (error) {
    console.log(error);
  }
};
// const getContrAgents = async (req, res) => {
//   const { search } = req.body;
// console.log(search);
//   try {
//     const connection = await oracledb.getConnection(pool);
//     const result = await connection.execute(
//       `select * from ictdat.ur 
//       WHERE NDOV LIKE '${search}%'
//       OR NDOV LIKE '$${search}'
//       OR NDOV LIKE '${search}'
//       OR ZKPO LIKE '${search}'
//       OR ZKPO LIKE '${search}$' 
//       OR ZKPO LIKE '$${search}'
//       OR UPPER( NDOV ) LIKE '${search}%'
//       OR UPPER( NDOV ) LIKE '%${search}_%'
//       OR UPPER( NDOV ) LIKE '% ${search}'
//       OR UPPER( NDOV ) LIKE '%${search} %'
//       OR LOWER( NDOV ) LIKE '${search}%'
//       OR LOWER( NDOV ) LIKE '%${search} %'
//       OR LOWER( NDOV ) LIKE '%_${search}'
//       OR LOWER( NDOV ) LIKE '%${search} %'
//       OR NDOV LIKE '%_${search}_%'
//       OR NDOV LIKE '${search}_%'
//       OR NDOV LIKE '%_${search}'
//       OR NDOV LIKE '_${search}'
//       OR NDOV LIKE '_${search}_'
//       OR NDOV LIKE '${search}_'
//       OR NDOV LIKE '${search}_%'
//       `
//     );
//     res.status(200).json(result.rows);
//     if (!result) {
//       res.status(401).json({ message: "error" });
//     }
//   } catch (error) {
//     console.log(error);
//   }
// };



const getContrAgents = async (req, res) => {
  const { search } = req.body;
  console.log(search);

  // Створюємо параметризований запит
  const query = `
    SELECT * FROM (
      SELECT * FROM ictdat.ur
      WHERE 
        (UPPER(NDOV) LIKE UPPER(:search) || '%' OR LOWER(NDOV) LIKE LOWER(:search) || '%')
        OR (UPPER(ZKPO) LIKE UPPER(:search) || '%' OR LOWER(ZKPO) LIKE LOWER(:search) || '%')
      ORDER BY NDOV
    ) WHERE ROWNUM <= 10
  `;

  try {
    const connection = await oracledb.getConnection(pool);
    const result = await connection.execute(query, [search]);

    if (result.rows && result.rows.length > 0) {
      res.status(200).json(result.rows); // Повертаємо 10 результатів
    } else {
      res.status(404).json({ message: "No results found" }); // Якщо не знайдено результатів
    }
  } catch (error) {
    console.error("Error fetching contract agents:", error);
    res.status(500).json({ message: "Internal server error" }); // Повідомлення про помилку
  }
};

const getOneAgent = async (req, res) => {
  const { id } = req.params;
 
  try {
    const connection = await oracledb.getConnection(pool);
    connection.currentSchema = "ICTDAT";
    const result = await connection.execute(
      `SELECT a.NUR,a.KOD FROM ictdat.ur a where a.kod = ${id}
      `
    );
    console.log(result.rows);
    res.status(200).json(result.rows[0]);
    if (!result) {
      res.status(401).json({ message: "error" });
    }

    console.log(result);
    
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllCustomers,
  getAllExpeditions,
  getAllСarriers,
  getContrAgents,
  getOneAgent
};
