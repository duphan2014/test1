'use strict';

const express = require('express');
const app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

const tests = require('./tests.json');

const tools = require('./tools');

const puppeteer = require('puppeteer');
const request_client = require('request-promise-native');
const fs = require('fs');


var test;

app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));

app.get('/index', (req, res) => {
  //res.send('Hello World!');
  res.render('index');
});

app.get('/tests', (req, res) => {
	test = tests.tests.find(t => t.id === req.query.id); 
	res.render('tests', {
		title: `Test: ${test.name} by ${test.author}`,
		test,
	})

})

var socketG;
io.on('connection', function(socket) {
   console.log('A user connected');
   socketG = socket;
   socket.on('disconnect', function () {
      console.log('A user disconnected');
   });
});





app.post('/runTest', function(req, res){
	res.render('tests', {
		title: `Test: ${test.name} by ${test.author}`,
		test,
		step: 'fuck you'
	})

	var steps = test.steps;
	var socket = socket;
	console.log(steps);

	(async () => {
		const browser = await puppeteer.launch();
		const page = await browser.newPage();
		var result;
		var currentStepIndex;

		await page.setRequestInterception(true);

		result = {
			"testId": test.id,
			"testName": test.name,
			"testAuthor": test.author,
			"testRunTime": Date.now(),
			"stepResults": []
		}

		page.on('request', request => {
			request_client({
			  uri: request.url(),
			  resolveWithFullResponse: true,
			}).then(response => {
			  const request_url = request.url();
			  result.stepResults[currentStepIndex].requests.push({"requestUrl" : request_url});

			  /*
			  if(request_url.match(/google-analytics.com/i)){
			    var tid = request_url.match(/tid=([^&]*)/)?request_url.match(/tid=([^&]*)/)[0]:'tid=undefined';
			    var ec = request_url.match(/ec=([^&]*)/)?request_url.match(/ec=([^&]*)/)[0]:'ec=undefined';
			    var ea = request_url.match(/ea=([^&]*)/)?request_url.match(/ea=([^&]*)/)[0]:'ea=undefined';
			    var el = request_url.match(/el=([^&]*)/)?request_url.match(/el=([^&]*)/)[0]:'el=undefined';

			    fs.appendFile("./network_requests_output.txt", 
			      '============================================ \n\r' +
			      request_url + '\n\r' + 
			      tid + '\n\r' + 
			      ec + '\n\r' + 
			      ea + '\n\r' + 
			      el + '\n\r', 
			      'utf8', function(err) {
			      if(err) {
			          return console.log(err);
			      }
			    });
			  }*/
			  request.continue();
			}).catch(error => {
			  request.abort();
			});
		});
		

		for(var i in steps){
			var step = steps[i];
			console.log('running step:');
			console.log(step);
			currentStepIndex = i;
			socketG.emit('updateCurrentStepName', { numSteps: steps.length, index: step.index, currentStep: step.action + ": " + step.selector});
			if(step.action == 'goto'){
				result.stepResults.push({
				  	"index": step.index,
				  	"action": step.action,
				  	"selector": step.selector,
				  	"requests":[]
				});
				await page.goto(step.selector, {
					waitUntil: 'networkidle0',
				});
			}else if(step.action == 'click'){
				result.stepResults.push({
				  	"index": step.index,
				  	"action": step.action,
				  	"selector": step.selector,
				  	"requests":[]
				});
				await page.waitForSelector(step.selector);
				await page.click(step.selector).catch(error => {
					console.error(error);
				});
				await page.waitFor(3000);
			}else if(step.action == 'end'){
				result.stepResults.push({
				  	"index": step.index,
				  	"action": step.action,
				  	"selector": step.selector,
				  	"requests":[]
				});
				console.log('Test finished');
				console.log(result);
				console.log(result.stepResults);

				//write to JSON file
				var jsonContent = JSON.stringify(result);
				console.log(jsonContent);
				var testResultFileName = "testResult_raw_" + test.id + "_" + Date.now();
				fs.writeFile(testResultFileName, jsonContent, 'utf8', function (err) {
				    if (err) {
				        console.log("An error occured while writing JSON Object to File.");
				        return console.log(err);
				    }
				 
				    console.log("Test result JSON file has been saved: " + testResultFileName);
				    console.log("use this app to read https://countwordsfree.com/jsonviewer");
				});

				// tell client that the test finished running
				socketG.emit('finishTest', result);
			}

		}

		await browser.close();
	})();
});

app.get('/printString', function(req, res){
    
});


// const server = app.listen(3000, () => {
//   console.log(`Express running → PORT ${server.address().port}`);
// });

http.listen(3000, () => {
  console.log(`Express running → PORT ${http.address().port}`);
});