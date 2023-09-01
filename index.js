// Import required modules
const https = require('https');
const fs = require('fs');
const schedule = require('node-schedule');
const axios = require('axios');

// Schedule the job to run at midnight every day
schedule.scheduleJob('0 0 * * *', downloadPrayerAPI);

// Schedule the function to run every minute on the minute
schedule.scheduleJob('0 * * * * *', isItPrayerTime);

// Schedule a job to play the 'fridaysurah' preset every Friday at 12 PM
schedule.scheduleJob('0 12 * * 5', fridaySurah);

/**
 * Fetches daily prayer timings from an external API
 */
function downloadPrayerAPI() {
  axios.get('https://api.aladhan.com/v1/timingsByCity?city=Dallas&method=15&country=US&tune=0,3,0,4,0,3,0,0,0')
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

/**
 * Saves daily prayer timings to a JSON file
 * @param {Object} prayerTimes - The prayer times object to save
 */
function saveAzaanTimes(prayerTimes) {
  fs.writeFile('output.json', JSON.stringify(prayerTimes), err => {
    if (err) console.error('Error writing file:', err);
    else console.log('Prayer times saved to file.');
  });
}

/**
 * Checks if it's time for prayer and calls for prayer if necessary
 */
function isItPrayerTime() {
  // Read daily prayer timings from file
  const prayerTimes = JSON.parse(fs.readFileSync('output.json'));

  // Get the current time
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  // Check if it's time for any of the five daily prayers
  const timings = prayerTimes.data.timings;
  
  // Define the primary 5 prayers
  const primaryPrayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

  // Filter the timings object to only include the primary 5 prayers
  const primaryPrayerTimings = Object.keys(timings)
    .filter(prayer => primaryPrayers.includes(prayer))
    .reduce((obj, prayer) => {
      obj[prayer] = timings[prayer];
      return obj;
    }, {});

  const prayerName = Object.keys(primaryPrayerTimings).find(prayer => primaryPrayerTimings[prayer] === time);

  if (prayerName) {
    callForPrayer(prayerName);
  } else {
    console.log(`It's not prayer time. Current time: ${time}`);
  }
}

/**
 * Triggers an event to call for prayer
 * @param {string} prayer - The name of the prayer to call for
 */
function callForPrayer(prayer) {
  console.log(`It's ${prayer} prayer time!`);

  const presetName = prayer === 'Fajr' ? 'Fajar' : 'example';
  axios.get(`http://localhost:5005/preset/${presetName}`)
    .then(res => console.log(res.data))
    .catch(err => console.error('Error calling for prayer:', err));
}

/**
 * Triggers an event to call for prayer
 * @param {string} prayer - The name of the prayer to call for
 */
function callForPrayer(prayer) {
  console.log(`It's ${prayer} prayer time!`);

  const presetName = prayer === 'Dhuhr' ? 'Dhuhr' : 'example';
  axios.get(`http://localhost:5005/preset/${presetName}`)
    .then(res => console.log(res.data))
    .catch(err => console.error('Error calling for prayer:', err));
}

/**
 * Triggers an event to play Friday Surah
 */
function fridaySurah() {
  console.log(`It's Friday Surah`);
  axios.get('http://localhost:5005/preset/FridayQuran')
    .then(res => console.log(res.data))
    .catch(err => console.error('Error calling for Friday Surah:', err));
}
