const Telegraf = require("telegraf");
const axios = require("axios");
const moment = require("moment");

const bot = new Telegraf('622577217:AAEtO2WIewUubFurUW5X6_1vy9f5K58rwm8');

bot.start(ctx => {
    ctx.reply('Hello World');
});

bot.on("text", ctx => {
    axios
        .get("https://ezanvakti.herokuapp.com/vakitler?ilce=9541")
        .then(function (response) {
            if (response.data.length > 0) {
                let dataDate = moment(response.data[0].MiladiTarihUzunIso8601).format("YYYY-MM-DD");
                let dataTime = response.data[0].Aksam;
                let cal = calculate(dataDate, dataTime);
                let result = message(cal);

                ctx.reply(result);
            } else {
                ctx.reply("API not working.");
            }
        })
        .catch(function (error) {
            console.log(error);
            ctx.reply("API not working.");
        });
});

bot.startPolling();

function message(data) {
    let result = "";

    if (data !== null && data !== undefined) {
        if (data[0] !== "00" && data[1] === "00") {
            result = "İftara" + " " + data[0] + " " + "saat kaldı.";
        } else {
            if (data[0] === "00" && data[1] !== "00") {
                result = "İftara" + " " + data[1] + " " + "dakika kaldı.";
            } else {
                result = "İftara" + " " + data[0] + " " + "saat" + " " + data[1] + " " + "dakika kaldı.";
            }
        }
    } else {
        result = "Invalid Time.";
    }

    return result;
}

function calculate(date, time) {
    let full = date + " " + time + ":00+03";
    let formattedDate = moment(full).utc().format();
    let theevent = moment(formattedDate);
    now = moment(new Date()).utc();
    let duration = moment(theevent.diff(now)).utc().format("HH:mm");
    let result = duration.split(":");
    
    return result;
}