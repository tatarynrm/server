const { ict_managers: pool } = require('../../db/noris/noris');

// Отримання всіх налаштувань користувача
async function getUserSettings(req, res) {
  const { userId } = req.body;

  try {
    // Окремо вибираємо потрібні поля для зменшення навантаження
    const result = await pool.query(
      'SELECT notifications_enabled, two_factor_auth_enabled, add_new_zap_enabled FROM user_settings WHERE user_id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      // Повертаємо порожній масив, якщо налаштування не знайдено
      return res.json([]);
    }

    const { notifications_enabled, two_factor_auth_enabled, add_new_zap_enabled } = result.rows[0];

    // Повертаємо налаштування у вигляді масиву
    const settings = [
      { type: 'notifications_enabled', enabled: notifications_enabled ?? false },
      { type: 'two_factor_auth_enabled', enabled: two_factor_auth_enabled ?? false },
      { type: 'add_new_zap_enabled', enabled: add_new_zap_enabled ?? false },
    ];

    res.json(settings);
  } catch (error) {
    console.error('Error fetching user settings:', error);
    res.status(500).send('Error fetching user settings');
  }
}

// Оновлення налаштувань користувача
async function updateSettings(req, res) {
  const { userId, settings } = req.body;

  try {
    // Оновлюємо всі налаштування в базі даних
    const updatePromises = settings.map(({ type, enabled }) => {
      const query = `UPDATE user_settings SET ${type} = $1 WHERE user_id = $2`;
      return pool.query(query, [enabled, userId]);
    });

    // Очікуємо завершення всіх оновлень
    await Promise.all(updatePromises);

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).send('Error updating settings');
  }
}

module.exports = { updateSettings, getUserSettings };
