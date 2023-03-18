// Import required modules
const https = require('https');
const fs = require('fs');
const schedule = require('node-schedule');
const axios = require('axios');

// This will schedule the job to run when the seconds and minutes fields are both 0, which corresponds to midnight.
schedule.scheduleJob('0 0 * * *', downloadPrayerAPI);
// schedule.scheduleJob('0 * * * * *', downloadPrayerAPI);

// Schedule the function to run every minute on the minute
schedule.scheduleJob('0 * * * * *', isItPrayerTime);

// Schedule a job to play the 'fridaysurah' preset every Friday at 12 PM
schedule.scheduleJob('0 12 * * 5', fridaySurah);

// Get daily prayer timings from an external API
function downloadPrayerAPI() {
  axios.get('https://api.aladhan.com/v1/timingsByCity?city=Allen&method=15&country=US&tune=0,3,0,4,0,3,0,0,0')
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
  const prayerTimes = JSON.parse(fs.readFileSync('output.json'));

  // // Get the current time
  // const now = new Date();
  // const time = `${now.getHours()}:${now.getMinutes()}`;
  // console.log(time);

  // What time is it right now
  const today = new Date()

  // current hours
  let hours = today.getHours();
  hours = ("0" + hours).slice(-2);

  // current minutes
  let minutes = today.getMinutes();
  minutes = ("0" + minutes).slice(-2);

  // combine hours and minutes to match
  let time = hours + ":" + minutes

  // Check if it's time for any of the five daily prayers
  let prayerName = '';
  if (time === prayerTimes.data.timings.Fajr) prayerName = 'Fajr';
  else if (time === prayerTimes.data.timings.Dhuhr) prayerName = 'Dhuhr';
  else if (time === prayerTimes.data.timings.Asr) prayerName = 'Asr';
  else if (time === prayerTimes.data.timings.Maghrib) prayerName = 'Maghrib';
  else if (time === prayerTimes.data.timings.Isha) prayerName = 'Isha';

  if (prayerName) {
    callForPrayer(prayerName);
  } else {
    console.log('It\'s not prayer time.' + " ~~~~~~ It is: " + time);
  }
}

// Trigger an event to call for prayer
function callForPrayer(prayer) {
  console.log(`It's ${prayer} prayer time!`);

  if (prayer = "Fajr") {
    axios.get('http://localhost:5005/preset/Fajar')
      .then(res => console.log(res.data))
      .catch(err => console.error('Error calling for prayer:', err));
  }
  else {
    axios.get('http://localhost:5005/preset/example')
      .then(res => console.log(res.data))
      .catch(err => console.error('Error calling for prayer:', err));
  }
}

// Trigger an event to call for prayer
function fridaySurah() {
  console.log(`It's Friday Surah`);
  axios.get('http://localhost:5005/preset/FridayQuran')
    .then(res => console.log(res.data))
    .catch(err => console.error('Error calling for Friday Surah:', err));
}