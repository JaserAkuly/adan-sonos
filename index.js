'use strict';
var http = require("https");
const axios = require('axios')
var https = require("https");
const fs = require('fs');
// const path = 'output.json'

// Download Latest Time 


setInterval(function () {
    // checkPrayerAPI();
    isItPrayerTime();
}, 60 * 1000);

// Daily Prayer Download (This needs to run once a day, every night at 12:01am to take the new days timings)
function downloadPrayerAPI() {
    var options = {
        "method": "GET",
        "hostname": "aladhan.p.rapidapi.com",
        "port": null,
        "path": "/timingsByCity?state=Tx&method=2&city=Dallas&country=US",
        "headers": {
            "x-rapidapi-host": "aladhan.p.rapidapi.com",
            "x-rapidapi-key": "315bc4bd0emshd573c11770e6614p15e832jsn4604ca1ad8df"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            // deletePrayerTimeFile()
            saveAzaanTimes(body)
        });


    });

    req.end();
}

function isItPrayerTime() {
    downloadPrayerAPI()
    //Obtain Output file Data
    let rawdata = fs.readFileSync('output.json');
    let todaysPrayerTimes = JSON.parse(rawdata);

    // What time is it right now
    const today = new Date()

    // current hours
    let hours = today.getHours();

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

// function deletePrayerTimeFile() {
//     fs.unlink(path, (err) => {
//         if (err) {
//           console.error(err)
//           return
//         }
//         console.log("JSON file has been deleted.");
//         //file removed
//       })
// }

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

function callForPrayer() {
    axios.get('http://localhost:5005/preset/example', {})
        .then((res) => {
            console.log(res)
        })
        .catch((error) => {
            console.error(error)
        })
}

function pauseSonos() {
    axios.get('http://localhost:5005/pauseall', {})
        .then((res) => {
            console.log(res)
        })
        .catch((error) => {
            console.error(error)
        })
}




