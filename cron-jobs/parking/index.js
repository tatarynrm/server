const cron = require("node-cron");
const oracledb = require("oracledb");
const parkingdb = require("../../db/parking/parking.pool");
const { Client } = require("pg");
const pool = require("../../db/pool");

// Назви таблиць
const ORACLE_TABLE = "SOURCE_TABLE";
const PG_TABLE = "target_table";
const startParkingCrone = () => {
  // CRON задача — кожні 15 хвилин
cron.schedule("*/5 * * * *", async () => {
    console.log(`[${new Date().toISOString()}] Запуск синхронізації...`);

    let connection;

    try {
      connection = await oracledb.getConnection(pool);

      const result = await connection.execute(
        `SELECT DERNOM,VLAS,TELEFON,DATZ,DATV,ONST,PLACE,RAZ,OPLTO,DNIST,NTYPE FROM ictdat.v_stautomess`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      const rows = result.rows;

      if (!rows || rows.length === 0) {
        console.log("Oracle: таблиця порожня.");
        return;
      }

      console.log(rows, "ROWS");

      await parkingdb.query(`DELETE FROM parking_parked_cars`);
      console.log("Таблиця parking_parked_cars очищена.");

      const columns = [
        '"DERNOM"',
        '"VLAS"',
        '"TELEFON"',
        '"DATZ"',
        '"DATV"',
        '"ONST"',
        '"PLACE"',
        '"RAZ"',
        '"OPLTO"',
        '"DNIST"',
        '"NTYPE"',
      ];

      const values = [];
      const placeholders = [];

      rows.forEach((row, rowIndex) => {
        const rowPlaceholders = columns.map(
          (_, colIndex) => `$${rowIndex * columns.length + colIndex + 1}`
        );
        placeholders.push(`(${rowPlaceholders.join(", ")})`);

        for (const col of columns) {
          // Видаляємо лапки для звернення до ключа обʼєкта
          const key = col.replace(/"/g, "");
          values.push(row[key.toUpperCase()] ?? null); // ключі з Oracle у верхньому регістрі
        }
      });

      const insertQuery = `
  INSERT INTO parking_parked_cars (${columns.join(", ")})
  VALUES ${placeholders.join(", ")}
`;

      await parkingdb.query(insertQuery, values);
    } catch (err) {
      console.error("Помилка під час синхронізації:", err);
    } finally {
      if (connection) await connection.close();
    }
  });
};

module.exports = {
  startParkingCrone,
};
