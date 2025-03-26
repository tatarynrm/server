const { norisdb, ict_managers } = require("../../db/noris/noris");

const getLastMessages = async (req, res) => {
  try {
    const result = await ict_managers.query(
      `
SELECT * FROM chat
ORDER BY created_at DESC
LIMIT 100;
         `
    );
console.log(result.rows);

    if (result.rows) {
      res.json(result.rows);
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  getLastMessages
};
