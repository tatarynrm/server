const { ict_mobile } = require("../../db/noris/noris");

const getFaq = async (req, res) => {
  try {
    // Перевірка, чи існує користувач з таким email або externalId
    const result = await ict_mobile.query("SELECT * FROM faq_users order by id asc");

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error saving user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
const createFaq = async (req, res) => {
  const { title, description } = req.body;

  try {
    // Перевірка, чи існує користувач з таким email або externalId
    const result = await ict_mobile.query(
      "insert into faq_users (title,description) values($1,$2)",
      [title, description]
    );
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error saving user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  getFaq,
  createFaq,
};
