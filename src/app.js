const Helper = require('./helper');
const Const = require("./const.json");
const Telegraf = require("telegraf");
const axios = require("axios");
const moment = require("moment");

const bot = new Telegraf(Const.BOT_TOKEN);
const monosay = require('monosay').usetelegraf(Const.MONOSAY_TOKEN);
monosay.init(bot);

bot.start(ctx => {
    monosay.data("Members").where("TelegramId", "==", (ctx.from.id).toString()).list(
        function (data) {
            if (data.data.itemCount === 0) {
                monosay.data("Members").save({
                        TelegramId: (ctx.from.id).toString(),
                        UserName: ctx.from.username,
                        Name: ctx.from.first_name,
                        CreatedDate: new Date()
                    },
                    function (result) {
                        ctx.reply("Merhaba " + ctx.from.first_name + " ✋ \nBotu kullanarak iftar saatlerini öğrenebilirsiniz.");
                    },
                    function (result) {
                        ctx.reply("Database not working.");
                    }
                );
            } else {
                ctx.reply("Merhaba " + data.data.items[0].Name + " ✋ \nBotu kullanarak iftar saatlerini öğrenmeye devam edebilirsiniz.")
            }
        },
        function (result) {
            ctx.reply("Database not working.");
        }
    )
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