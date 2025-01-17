const { ict_mobile } = require("../../db/noris/noris");


const mobile_login = async (req, res) => {
    const { email, firstName, lastName, avatarUrl, provider, externalId } = req.body;
console.log(req.body);

    try {
      // Перевірка, чи існує користувач з таким email або externalId
      const existingUser = await ict_mobile.query("SELECT * FROM users WHERE email = $1 OR external_id = $2", [email, externalId]);

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ message: "User already exists." });
      }
  
      // Додавання нового користувача до бази даних
      const result = await pool.query(
        "INSERT INTO users (email, first_name, last_name, avatar_url, provider, external_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [email, firstName, lastName, avatarUrl, provider, externalId]
      );
  
      return res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
    } catch (error) {
      console.error("Error saving user:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = {
    mobile_login
};
