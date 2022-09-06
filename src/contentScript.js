'use strict';
import { Amplify, API, graphqlOperation } from 'aws-amplify';
import { createUpdateMessage, updateUpdateMessage } from './graphql/mutations';
import awsmobile from './aws-exports';

console.log(awsmobile);
Amplify.configure(awsmobile);

var USERID = "Trj3Z04Rx04Zl2HGSggtk5Iu8S3yfrS";

// Content script file will run in the context of web page.
// With content script you can manipulate the web pages using
// Document Object Model (DOM).
// You can also pass information to the parent extension.

// We execute this script by making an entry in manifest.json file
// under `content_scripts` property

// For more information on Content Scripts,
// See https://developer.chrome.com/extensions/content_scripts

//var adRun = document.querySelector();
//var adSnooze = document.querySelector();

function w(s) {
  return new Promise(resolve => {
    if(document.querySelector(s)) {
      return resolve(document.querySelector(s));
    }

    var obs = new MutationObserver(m => {
      if(document.querySelector(s)) {
        resolve(document.querySelector(s));
        obs.disconnect();
      }
    });

    obs.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}
w("button[data-highlight-selector=\"run-ad-button\"]").then(e => { e.addEventListener("click", update, false); });
w("button[data-highlight-selector=\"snooze-button\"]").then(e => { e.addEventListener("click", update, false); });

var lastMessage = { userid: USERID, payload: "{}"};

//console.log("asadfasddasasd")
try {
  //console.log("asadfasddasasd2")
  API.graphql(graphqlOperation(createUpdateMessage, {input: lastMessage}, "API_KEY")).then(() => {
    setInterval(update, 5000);
  }).catch(e => {
    if(e.errors[0].errorType == "DynamoDB:ConditionalCheckFailedException") {
      setInterval(update, 5000);
    } else {
      throw e;
    }
  });
  //console.log("a");
} catch(e) {console.error(e); }

//console.log("asadfasddasasd3")

function sendMessage(payload) {
  //console.log("asadfasddasasd4")
  var message = lastMessage;
  message.payload = payload;
  API.graphql(graphqlOperation(updateUpdateMessage, {input: message})).then(e => {
    lastMessage = message;
  });
}

function update() {
  //console.log("asadfasddasasd5")
  fetch("https://gql.twitch.tv/gql", {
    "headers": {
      "accept": "*/*",
      "accept-language": "en-GB",
      "authorization": `OAuth ${document.cookie.split("; ").map(e => e.split("=")).filter(e => e[0] == "auth-token")[0][1]}`,
      "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      "client-integrity": "v4.public.eyJjbGllbnRfaWQiOiJraW1uZTc4a3gzbmN4NmJyZ280bXY2d2tpNWgxa28iLCJjbGllbnRfaXAiOiIxOTEuMTMuMjQ4LjUxIiwiZGV2aWNlX2lkIjoiTXA3WTFPZllBWmJzYTA3N0dRQXl0UjZhY3hmcFNRYXoiLCJleHAiOiIyMDIyLTA5LTAzVDA3OjI1OjMyWiIsImlhdCI6IjIwMjItMDktMDJUMjM6MjU6MzJaIiwiaXNfYmFkX2JvdCI6ImZhbHNlIiwiaXNzIjoiVHdpdGNoIENsaWVudCBJbnRlZ3JpdHkiLCJuYmYiOiIyMDIyLTA5LTAyVDIzOjI1OjMyWiIsInVzZXJfaWQiOiIzNjQxOTU1NSJ9GHNH2HzeeGq4-7q0LH1smHYmi4Ad5deuBmRV2Mkeyep3DT_96Y6BCUaP3Hh8r4H0zmK7XAy4hzeFK03I4qfrAg",
      "client-session-id": "dd9b321be4a6ad1f",
      "client-version": "fea3e5e8-99b5-496f-bf09-567fce560a7a",
      "content-type": "text/plain;charset=UTF-8",
      "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
      "sec-gpc": "1",
      "x-device-id": "Mp7Y1OfYAZbsa077GQAytR6acxfpSQaz"
    },
    "referrer": "https://dashboard.twitch.tv/",
    "referrerPolicy": "strict-origin-when-cross-origin",
    "body": `[{"operationName":"StreamerAdsManager_QueryAdProperties","variables":{"login": "${document.cookie.split("; ").map(e => e.split("=")).filter(e => e[0] == "login")[0][1]}","shouldSkipCIP":false},"extensions":{"persistedQuery":{"version":1,"sha256Hash":"42d19f285b491d9449fb08edcd68d7f22f2490178263aae3a60ecf8d6563d294"}}}]`,
    "method": "POST",
    "mode": "cors"
  }).then(x => x.text()).then(y => {
    //console.log(y)
    if(lastMessage.payload == "{}") {
      sendMessage(y);
    } else {
      var j = JSON.parse(y);
      var l = JSON.parse(lastMessage.payload);
      if(j[0].data == l[0].data) {
        return;
      }
      sendMessage(y);
    }
  });
}

// Log `title` of current active web page
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Communicate with background file by sending a message
chrome.runtime.sendMessage(
  {
    type: 'GREETINGS',
    payload: {
      message: 'Hello, my name is Con. I am from ContentScript.',
    },
  },
  (response) => {
    console.log(response.message);
  }
);

// Listen for message
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'COUNT') {
    console.log(`Current count is ${request.payload.count}`);
  }

  // Send an empty response
  // See https://github.com/mozilla/webextension-polyfill/issues/130#issuecomment-531531890
  sendResponse({});
  return true;
});