// See https://github.com/dialogflow/dialogflow-fulfillment-nodejs
// for Dialogflow fulfillment library docs, samples, and to report issues
'use strict';

const http = require('http');
const functions = require('firebase-functions');
const {WebhookClient} = require('dialogflow-fulfillment');
const {Card, Suggestion} = require('dialogflow-fulfillment');

process.env.DEBUG = 'dialogflow:debug'; // enables lib debugging statements

const host = 'https://sleepy-shore-81240.herokuapp.com/details';
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((req, res) => {
  let price_low = req.body.queryResult.parameters['number'];
  let price_high = req.body.queryResult.parameters['number1'];
  let city = req.body.queryResult.parameters['geo-city'];
  let type = req.body.queryResult.parameters['type1'];
  let brand = '';
  if(req.body.queryResult.parameters['brand']) {
    brand = req.body.queryResult.parameters['brand'];
    console.log('Brand' + brand)
  }
  // Call the dealers API
  callDealerApi(city, price_low, price_high, type, brand).then((output) => {
    res.json({ 'fulfillmentText': output });
  }).catch(() => {
    res.json({ 'fulfillmentText': `I am not able to find the dealers for you at this moment!` });
  });
});
function callDealerApi (city, price_low, price_high, type, brand) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the dealers
    let path = '/?format=json&price_gte=' + price_low + '&price_lte=' + price_high + '&city=' + city + '&type=' + type;

    console.log('API Request: ' + host + path);
    // Make the HTTP request to get the weather
    http.get({host: host, path: path}, (res) => {
      let body = ''; // var to store the response chunks
      res.on('data', (d) => { body += d; }); // store each response chunk
      res.on('end', () => {
        // After all the data has been received parse the JSON for desired data
        let response = JSON.parse(body);
        //let dealer = response['dealer'];
        //let score = response['dealer_score'];
        //let conditions = response['data']['current_condition'][0];
        //let currentConditions = conditions['weatherDesc'][0]['value'];
        // Create response
        let dealer = response[0]['dealer'];
        let output = `Current output is ${response}.`;
        // ${location['query']} are ${currentConditions} with a projected high of
        // ${forecast['maxtempC']}°C or ${forecast['maxtempF']}°F and a low of
        // ${forecast['mintempC']}°C or ${forecast['mintempF']}°F on
        // ${forecast['date']}.`;
        // Resolve the promise with the output text
        console.log(output);
        resolve(output);
      });
      res.on('error', (error) => {
        console.log(`Error calling: ${error}`)
        reject();
      });
    });
  });
}
