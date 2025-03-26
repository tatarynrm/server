const { norisdb, ict_managers } = require("../../db/noris/noris");

const getLastMessages = async (req, res) => {

    const {room_id} = req.body;
  try {
    const result = await ict_managers.query(
      `
SELECT * FROM chat
where deleted = false and room_id =$1
ORDER BY created_at ASC
LIMIT 100;
         `,[room_id]
    );



    if (result.rows) {
      res.json(result.rows);
    }
  } catch (error) {
    console.log(error);
  }
};
const deleteOneMessage = async (req, res) => {
    const { id } = req.body; // Отримуємо id повідомлення з тіла запиту
    try {
      const result = await ict_managers.query(
        `
        UPDATE chat 
        SET deleted = true 
        WHERE id = $1
        `, 
        [id] // id повідомлення, яке потрібно позначити як видалене
      );
  
      if (result.rowCount > 0) {
        // Якщо запис був успішно оновлений
        res.status(200).json({ message: 'Message marked as deleted' });
      } else {
        // Якщо запис не знайдений
        res.status(404).json({ message: 'Message not found' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting message' });
    }
  };
const getChatRooms = async (req, res) => {
    
    try {
      const result = await ict_managers.query(
        `
      select * from chat_rooms
        ` 
      );
  
res.json(result.rows)
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error deleting message' });
    }
  };

  


module.exports = {
  getLastMessages,
  deleteOneMessage,
  getChatRooms
};
