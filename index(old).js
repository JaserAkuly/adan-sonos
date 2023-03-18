const http = require("https");
const fs = require('fs');
var schedule = require('node-schedule');
const axios = require("axios");

// schedule.scheduleJob('0 0 * * *', () => { downloadPrayerAPI() }) // run everyday at midnight

// schedule.scheduleJob('*/1 * * * *', () => { downloadPrayerAPI() }) // run everyday at minute
schedule.scheduleJob('*/1 * * * *', () => { isItPrayerTime() }) // run everyday at minute

function downloadPrayerAPI() {
    const options = {
        "method": "GET",
        "hostname": "api.aladhan.com",
        "port": null,
        "path": "/v1/timingsByCity?city=Dallas&country=US&tune=0,-20,0,4,1,4,0,5,0",
    };
    
    const req = http.request(options, function (res) {
        const chunks = [];
    
        res.on("data", function (chunk) {
            chunks.push(chunk);
        });
    
        res.on("end", function () {
            const body = Buffer.concat(chunks);
            console.log(body.toString());
            saveAzaanTimes(body)
            console.log(body)
        });
    });
    
    req.end();
}

function saveAzaanTimes(body) {
    // parse json
    var jsonObj = JSON.parse(body);

    // stringify JSON Object
    var jsonContent = JSON.stringify(jsonObj);

    fs.writeFile("output.json", jsonContent, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }

        console.log("JSON file has been saved.");
    });
}

function isItPrayerTime() {
    //Obtain Output file Data
    let rawdata = fs.readFileSync('output.json');
    let todaysPrayerTimes = JSON.parse(rawdata);

    // What time is it right now
    const today = new Date()

    // current hours
    let hours = today.getHours();
    hours = ("0" + hours).slice(-2);

    // current minutes
    let minutes = today.getMinutes();
    minutes = ("0" + minutes).slice(-2);

    // combine hours and minutes to match
    let currentTime = hours + ":" + minutes
    console.log(currentTime)

    compareTimeToPrayer();
    function compareTimeToPrayer() {
        if (currentTime == todaysPrayerTimes.data.timings.Fajr) {
            console.log("Its Fajr Time")
            callForPrayer()
        } else if (currentTime == todaysPrayerTimes.data.timings.Dhuhr) {
            console.log("Its Dhuhr Time")
            callForPrayer()
        } else if (currentTime == todaysPrayerTimes.data.timings.Asr) {
            console.log("Its Asr Time")
            callForPrayer()
        } else if (currentTime == todaysPrayerTimes.data.timings.Maghrib) {
            console.log("Its Maghrib Time")
            callForPrayer()
        } else if (currentTime == todaysPrayerTimes.data.timings.Isha) {
            console.log("Its Isha Time")
            callForPrayer()
        } else {
            console.log("It's not Prayer Time Yet.")
        }
    
    }
}

function callForPrayer() {
    axios.get('http://localhost:5005/preset/example', {})
        .then((res) => {
            console.log(res)
        })
        .catch((error) => {
            console.error(error)
        })
}
