const Helper = require('./helper');
const Const = require("./const.json");
const Telegraf = require("telegraf");
const axios = require("axios");
const moment = require("moment");

const bot = new Telegraf(Const.BOT_TOKEN);

bot.start(ctx => {
    ctx.reply('Hello World');
});

bot.on("text", ctx => {
    axios
        .get(Const.API_URLS.DEFAULT_TIMES)
        .then(function (response) {
            if (response.data.length > 0) {
                let dataDate = moment(response.data[0].MiladiTarihUzunIso8601).format("YYYY-MM-DD");
                let dataTime = response.data[0].Aksam;
                let cal = Helper.calculate(dataDate, dataTime);
                let result = Helper.message(cal);

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