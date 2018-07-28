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