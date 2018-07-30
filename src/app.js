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

bot.on('location', (ctx) => {
    let x = ctx.update.message.location.latitude.toString();
    let y = ctx.update.message.location.longitude.toString();
    let url = Const.API_URLS.GOOGLE_MAP_URL + x + "," + y + "&key=" + Const.API_URLS.GOOGLE_MAP_KEY;

    // Geocoding API -> Enlem ve boylamdan lokasyonu alıyoruz
    axios.get(url)
        .then(function (response) {
            let city = response.data.results[0]["address_components"].filter(a => a.types.indexOf("administrative_area_level_1") > -1)[0].long_name;
            let countyName = response.data.results[0]["address_components"].filter(a => a.types.indexOf("administrative_area_level_2") > -1)[0].long_name;

            if (city !== null && city !== undefined) {
                let cityName = city.toUpperCase();

                // Ezan Vakti API -> Şehirleri çekiyoruz 
                axios.get(Const.API_URLS.CITIES)
                    .then(function (response) {
                        if (response.data !== null) {
                            response.data.forEach(element => {
                                if (element.SehirAdi === cityName) {
                                    let cityId = element.SehirID;

                                    if (cityId !== null && cityId !== undefined) {
                                        // Ezan Vakti API -> İlçeleri çekiyoruz 
                                        axios.get(Const.API_URLS.COUNTIES + cityId)
                                            .then(function (response) {
                                                let countyId = response.data[0].IlceID;

                                                if (countyId !== null && countyId !== undefined) {
                                                    // Ezan Vakti API -> Ezan saatlerini çekiyoruz 
                                                    axios.get(Const.API_URLS.ALL_TIMES + countyId)
                                                        .then(function (response) {
                                                            let dataDate = moment(response.data[0].MiladiTarihUzunIso8601).format("YYYY-MM-DD");
                                                            let dataTime = response.data[0].Aksam;
                                                            let cal = Helper.calculate(dataDate, dataTime);
                                                            let result = Helper.message(cal);

                                                            // Bota lokasyon atanların datalarını "monosay" üstünde kayıt ediyoruz 
                                                            monosay.data("Locations").save({
                                                                    TelegramId: (ctx.from.id).toString(),
                                                                    UserName: ctx.from.username,
                                                                    City: cityName,
                                                                    County: countyName,
                                                                    Latitude: (x).toString(),
                                                                    Longitude: (y).toString(),
                                                                    CreatedDate: new Date()
                                                                },
                                                                function (member) {
                                                                    console.log("Location saved");
                                                                },
                                                                function (result) {
                                                                    console.log("Location not saved");
                                                                });

                                                            ctx.reply(result);
                                                        })
                                                        .catch(function (error) {
                                                            console.log(error);
                                                            ctx.reply("Bot Location API not working.");
                                                        });
                                                } else {
                                                    ctx.reply("Bot Location API not working.");
                                                }
                                            })
                                            .catch(function (error) {
                                                console.log(error);
                                                ctx.reply("Bot Location API not working.");
                                            });
                                    }
                                    return;
                                }
                            });
                        } else {
                            ctx.reply("Bot Location API not working.");
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                        ctx.reply("Bot Location API not working.");
                    });
            } else {
                ctx.reply("Bot Location API not working.");
            }
        })
        .catch(function (error) {
            console.log(error);
            ctx.reply("Bot Location API not working.");
        });
})

bot.startPolling();