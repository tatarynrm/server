const bot = require('./telegram_bot')


const sendMessageToGroup = (bot,data)=>{
    return     bot.telegram.sendMessage(
        -1001894284480,
        `👉Користувач ${data.PIP} щойно добавив\nнову заявку: ✅<code><b>${data.ZAP_KOD}</b></code>\nЗавантаження: ${data.pZav}\nВивантаження: ${data.pRozv}\nІнформація: ${data.pZapText}\nПереглянути заявку: http://192.168.5.180`,
        { parse_mode: "HTML" }
      );
}





module.exports = {
    sendMessageToGroup
}