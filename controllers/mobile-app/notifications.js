const { ict_mobile } = require("../../db/noris/noris");
const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const saveUserPushToken = async (req, res) => {
  const { userId, pushToken } = req.body;

  console.log("DASSSAAAAAAAAAAAAAAAAAA", userId, pushToken);

  try {
    // Перевіряємо, чи вже існує комбінація userId та pushToken
    const existingUser = await ict_mobile.query(
      "SELECT * FROM users_push_tokens WHERE user_id = $1 AND push_token = $2",
      [userId.toString(), pushToken]
    );

    if (existingUser.rows.length > 0) {
      // Якщо така комбінація вже існує, не робимо нічого
      return res.json({
        success: true,
        message:
          "Push token is already associated with this userId. No action needed.",
      });
    } else {
      // Якщо такої комбінації немає, додаємо новий запис
      const newUser = await ict_mobile.query(
        "INSERT INTO users_push_tokens(user_id, push_token) VALUES($1, $2) RETURNING *",
        [userId, pushToken]
      );

      return res.json({
        success: true,
        message: "Push token saved successfully",
        data: newUser.rows[0],
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("An error occurred");
  }
};

const sendPushNotification = async (req, res) => {
  const { userId, message, screen, deepLink } = req.body;
console.log('REQ BODY SEND NOTIFICATION',req.body);

  try {
    // Отримуємо всі push токени користувача з бази даних
    const result = await ict_mobile.query(
      "SELECT * FROM users_push_tokens WHERE user_id = $1",
      [userId]
    );

    console.log("ALL PUSH", result.rows[0]);

    if (result.rows.length > 0) {
      // Перебираємо всі рядки результату (можливо, у користувача є кілька пристроїв)
      const messages = [];

      result.rows.forEach((row) => {
        const pushToken = row.push_token;

        // Перевірка на валідність push токена
        if (Expo.isExpoPushToken(pushToken)) {
          // Додаємо повідомлення для кожного токену
          messages.push({
            to: pushToken,
            sound: "default",
            body: message,
            data: {
              screen: screen ? screen : null,
              deepLink: deepLink ? deepLink : null,
            }, // Вказуємо, на який екран перейти
          });
        } else {
          console.log(`Invalid Expo push token: ${pushToken}`);
        }
      });

      // Якщо є валідні токени, відправляємо повідомлення
      if (messages.length > 0) {
        const ticketChunk = await expo.sendPushNotificationsAsync(messages);
        console.log("Ticket response:", ticketChunk);
      } else {
        console.log("No valid push tokens found for this user");
      }
    } else {
      console.log("User not found or has no push token");
    }
  } catch (error) {
    console.error("Error sending push notification:", error);
  }
};

module.exports = {
  saveUserPushToken,
  sendPushNotification,
};
