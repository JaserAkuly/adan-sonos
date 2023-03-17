// Import required modules
const https = require('https');
const fs = require('fs');
const schedule = require('node-schedule');
const axios = require('axios');

// This will schedule the job to run when the seconds and minutes fields are both 0, which corresponds to midnight.
schedule.scheduleJob('0 0 * * *', downloadPrayerAPI);
// schedule.scheduleJob('*/1 * * *', downloadPrayerAPI);
schedule.scheduleJob('*/1 * * * *', isItPrayerTime);

// Get daily prayer timings from an external API
function downloadPrayerAPI() {
  axios.get('https://api.aladhan.com/v1/timingsByCity?city=Dallas&country=US')
    .then(response => {
      if (response.data) {
        saveAzaanTimes(response.data);
      } else {
        console.error('No data received from API');
      }
    })
    .catch(error => {
      console.error('Error making request to API:', error);
    });
}

// Save daily prayer timings to a JSON file
function saveAzaanTimes(prayerTimes) {
    console.log("saving function")
  fs.writeFile('output.json', JSON.stringify(prayerTimes), err => {
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
  let prayerName = '';
  if (time === prayerTimes.data.timings.Fajr) prayerName = 'Fajr';
  else if (time === prayerTimes.data.timings.Dhuhr) prayerName = 'Dhuhr';
  else if (time === prayerTimes.data.timings.Asr) prayerName = 'Asr';
  else if (time === prayerTimes.data.timings.Maghrib) prayerName = 'Maghrib';
  else if (time === prayerTimes.data.timings.Isha) prayerName = 'Isha';

  if (prayerName) {
    callForPrayer(prayerName);
    console.log(`It's ${prayerName} prayer time.`);
  } else {
    console.log('It\'s not prayer time.');
  }
}

// Trigger an event to call for prayer
function callForPrayer(prayer) {
  console.log(`It's ${prayer} prayer time!`);
  axios.get('http://localhost:5005/preset/example')
    .then(res => console.log(res.data))
    .catch(err => console.error('Error calling for prayer:', err));
}
