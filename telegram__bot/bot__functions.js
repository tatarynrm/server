const bot = require('./telegram_bot')


const sendMessageToGroup = (bot,data)=>{
    return     bot.telegram.sendMessage(
        -1001894284480,
        `👉Користувач ${data.PIP} щойно добавив\nнову заявку: ✅<code><b>${data.ZAP_KOD}</b></code>\nЗавантаження: ${data.pZav}\nВивантаження: ${data.pRozv}\nІнформація: ${data.pZapText}\nПереглянути заявку: https://noris-dev.space/logistic-work`,
        { parse_mode: "HTML" }
      );
}


const sendOTPCode = (bot,data) =>{
    console.log(data);
    return  bot.telegram.sendMessage(
        data.TELEGRAMID,
        `<b>Ваш код для авторизації на сайті:</b> \n\n<code>${data.OTPCODE}</code>`,
        { parse_mode: "HTML" }
      );
}


module.exports = {
    sendMessageToGroup,
    sendOTPCode
}