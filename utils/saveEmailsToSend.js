const xlsx = require('xlsx');
const {ictmainsite} = require("../db/noris/noris");
const path = require('path');
const { pool_emails_send } = require('../db/pg/email');
const moment = require('moment');
moment.locale('uk');




// 3. Функція для вставки даних
async function insertEmailsIntoTables(type,commentTitle,commentText,documentTitle) {

  const client = await pool_emails_send.connect();
  const date = new Date();
  const toTimestamp = (strDate) => Date.parse(strDate);
  const newDate = toTimestamp(date)




  // Отримуємо абсолютний шлях до файлу
const filePath = path.join(__dirname,'..','uploads/files', `${documentTitle}`);
const workbook = xlsx.readFile(filePath);
// 1. Зчитуємо Excel-файл

const sheetName = workbook.SheetNames[0]; // Вибираємо перший лист
const sheet = workbook.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet); // Перетворюємо на масив об'єктів
  try {
    // Приклад створення таблиці (налаштуйте під вашу структуру даних)
    await client.query(`
      CREATE TABLE IF NOT EXISTS emails_to_send_${type}_${newDate} (
        id SERIAL PRIMARY KEY,
        organization TEXT,
        contact_name TEXT,
        position TEXT,
        email TEXT,
        issend BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    await client.query(`
    COMMENT ON TABLE emails_to_send_${type}_${newDate} IS '${commentTitle} ${moment(newDate).format('LLL')}\n "${commentTitle}"';
      `);

      //  \n"${commentText}"
    // Вставка даних
    for (const row of data) {
  
        
  const result = await client.query(
        `INSERT INTO emails_to_send_${type}_${newDate} (organization, contact_name, position,email) VALUES ($1, $2, $3,$4)`,
        [row['Організація'], row['Контакт, Назва '], row['Контакт, Посада, примітка '],row['Контакт, Значення ']] // Замініть на ваші назви колонок з Excel
      );
    }

   
    
 return `emails_to_send_${type}_${newDate}`
  } catch (error) {
    console.error('Помилка під час імпорту:', error);
  } finally {
    client.release();
 
  }
}

module.exports = {
  insertEmailsIntoTables
}