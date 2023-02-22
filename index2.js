// Import required modules
const https = require('https');
const fs = require('fs');
const schedule = require('node-schedule');
const axios = require('axios');

// Schedule tasks to run every minute
schedule.scheduleJob('* * * * * *', downloadPrayerAPI);
schedule.scheduleJob('*/1 * * * *', isItPrayerTime);

// Get daily prayer timings from an external API
function downloadPrayerAPI() {
    https.get('https://api.aladhan.com/v1/timingsByCity?city=Dallas&country=US&tune=0,-20,0,4,1,4,0,5,0', res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (data.trim().length === 0) {
          console.error('No data received from API');
        } else {
          saveAzaanTimes(JSON.parse(data));
        }
      });
    });
  }

// Save daily prayer timings to a JSON file
function saveAzaanTimes(prayerTimes) {
    console.log("saving function")
  fs.writeFile('prayerTimes.json', JSON.stringify(prayerTimes), err => {
    console.log("saving now..")
    if (err) console.error('Error writing file:', err);
    else console.log('Prayer times saved to file.');
  });
}

// Check if it's time for prayer
function isItPrayerTime() {
  // Read daily prayer timings from file
  const prayerTimes = JSON.parse(fs.readFileSync('prayerTimes.json'));

  // Get the current time
  const now = new Date();
  const time = `${now.getHours()}:${now.getMinutes()}`;

  // Check if it's time for any of the five daily prayers
  if (time === prayerTimes.data.timings.Fajr) callForPrayer('Fajr');
  else if (time === prayerTimes.data.timings.Dhuhr) callForPrayer('Dhuhr');
  else if (time === prayerTimes.data.timings.Asr) callForPrayer('Asr');
  else if (time === prayerTimes.data.timings.Maghrib) callForPrayer('Maghrib');
  else if (time === prayerTimes.data.timings.Isha) callForPrayer('Isha');
}

// Trigger an event to call for prayer
function callForPrayer(prayer) {
  console.log(`It's ${prayer} prayer time!`);
  axios.get('http://localhost:5005/preset/example')
    .then(res => console.log(res.data))
    .catch(err => console.error('Error calling for prayer:', err));
}
