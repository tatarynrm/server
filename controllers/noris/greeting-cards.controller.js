const { ict_managers } = require("../../db/noris/noris");

const getAllGreetings = async (req, res) => {
  const { user_id } = req.body;

  try {
    const result = await ict_managers.query(
      `
      SELECT 
        a.*, 
        COALESCE(b.status, false) AS status 
      FROM 
        greeting_cards a
      LEFT JOIN 
        user_greeting_cards_status b 
      ON 
        a.id = b.text_id AND b.user_id = $1
      WHERE 
        a.active = true AND (b.status IS NULL OR b.status = false)
      `,
      [user_id]
    );

    console.log("RESULT GREETINGS", result.rows);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching greetings:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const changeStatusToActiveViewd = async (req, res) => {
  const { user_id, text_id } = req.body; // Отримуємо user_id і text_id з тіла запиту

  try {
    // Перевіряємо, чи є вже запис з таким user_id та text_id
    const result = await ict_managers.query(
      `SELECT * FROM user_greeting_cards_status WHERE user_id = $1 AND text_id = $2`,
      [user_id, text_id]
    );

    if (result.rows.length > 0) {
      // Якщо такий запис існує, перевіряємо статус
      const currentStatus = result.rows[0].status;

      if (currentStatus === false) {
        // Якщо статус false, оновлюємо його на true
      const resultUpdate =  await ict_managers.query(
          `UPDATE user_greeting_cards_status SET status = true WHERE user_id = $1 AND text_id = $2 returning *`,
          [user_id, text_id]
        );
        res.status(200).json(resultUpdate.rows[0]);
      } else {
        res.status(200).json({ message: "Greeting status is already true" });
      }
    } else {
      // Якщо запису немає, створюємо новий з status = true
      const resultInsert = await ict_managers.query(
        `INSERT INTO user_greeting_cards_status (user_id, text_id, status) VALUES ($1, $2, true) returning *`,
        [user_id, text_id]
      );
      res.status(201).json(resultInsert.rows[0]);
    }
  } catch (error) {
    console.error("Error updating or inserting greeting status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



module.exports = {
   // POST
    getAllGreetings,   
    changeStatusToActiveViewd
};
