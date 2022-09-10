'use strict';
import { Amplify, API, graphqlOperation } from 'aws-amplify';
import { createUpdateMessage, updateUpdateMessage } from './graphql/mutations';
import { getUpdateMessage } from './graphql/queries';
import { onUpdateUpdateMessage } from './graphql/subscriptions';
import awsmobile from './aws-exports';

import './content.scss';

Amplify.configure(awsmobile);

var USERID = "Trj3Z04Rx04Zl2HGSggtk5Iu8S3yfrj";

var BROADCASTER = false;
//var LIGHT_MODE = false;

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
    if(document.querySelectorAll(s).length != 0) {
      return resolve(document.querySelectorAll(s));
    }

    var obs = new MutationObserver(m => {
      if(document.querySelectorAll(s).length != 0) {
        resolve(document.querySelectorAll(s));
        obs.disconnect();
      }
    });

    obs.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}

var message = { userid: USERID, payload: "{}"};
var lastMessage = message;

var timer_status = {
  standby: "timer-status-standby",
  standby_near: "timer-status-standby-near",
  active: "timer-status-active",
  offline: "timer-status-offline",
  //offline_light: "timer-status-offline-light"
};

var timer_status_text = {
  standby: "STANDBY",
  standby_near: "STANDY",
  active: "ACTIVE",
  offline: "OFFLINE"
};

function broadcasterHandler() {
  w("button[data-highlight-selector=\"run-ad-button\"]").then(e => { e.forEach(i => { i.addEventListener("click", update, false); }); });
  w("button[data-highlight-selector=\"snooze-button\"]").then(e => { e.forEach(i => { i.addEventListener("click", update, false); }); });

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
        if(JSON.stringify(j[0].data) == JSON.stringify(l[0].data)) {
          return;
        }
        sendMessage(y);
      }
    });
  }
}

var lastReceived = 0;
var next = 0;
var nextAd = false;
var timer_status_class = timer_status.offline;

function pageInject(n) {
  //w("div[data-highlight-selector='active-mods']").then(a => {
    //a = a[0];
  //});
  w("p[title='Active Mods']").then(e => {
    e = e[0];
    e.title = "Ad Timer";
    e.innerText = "AD TIMER";
    var m = e.parentElement.parentElement.parentElement.parentElement;
    if(m.classList == "modview-dock-widget__preview") {
      m.style["height"] = "155px";
    }
  });
  w(".active-mods-list").then(b => {
    b = b[0].parentElement;
    var a = b.parentElement;
    b.remove();
    var c = document.createElement("div");
    a.insertBefore(c, a.firstChild);
    c.innerHTML = n;
  });
}


function getURL(url) {
  return ((chrome.runtime && chrome.runtime.getURL) ? chrome.runtime.getURL(url) : browser.runtime.getURL(url));
}

function modHandler() {
  try {
    var content = getURL("content.html");
  } catch(e) {
    var content = "content.html";
    debugger;
  }
  fetch(content, {
    "mode": "cors"
  }).then(x => x.text()).then(y => {
    /* if(LIGHT_MODE) {
      w(".card-timer-content").then((e) => {
        e.forEach(i => i.classList.add("card-content-light"));
      });
    } */
    pageInject(y);
    w("#contentScript-css").then(e => { 
      try {
        e[0].href = getURL("/contentScript.css");
      } catch(e) { console.error(e); }
    });
    updateTimer("00:00:00", timer_status_text.standby, timer_status_class);
    getMessage(USERID);
    onUpdateMessage(USERID);
    setTimeout(() => {
      w("p[title='Active Mods']").then(e => {
        modHandler();
      });
    }, 5000);
    return startTimer();
  });
}

function broadcasterPage() {
  return BROADCASTER;
}

if(broadcasterPage()) {
  broadcasterHandler();
} else {
  modHandler()
}

function getMessage(userid) {
  API.graphql({ query: getUpdateMessage, variables: {userid: userid}}).then((m) => {
    console.log(m);
    if(m.data.getUpdateMessage.payload == "{}") {
      console.log("Empty payload. Returning");
      return;
    }
    message = JSON.parse(m.data.getUpdateMessage.payload);
    updateAd();
    lastMessage = false;
  }).catch(e => {
    console.error(e);
  });
}

function onUpdateMessage(userid) {
  API.graphql(graphqlOperation(onUpdateUpdateMessage, {userid: userid})).subscribe(
    {
      next: (m) => {
        lastReceived = Date.now();
        lastMessage = message;
        message = JSON.parse(m.value.data.onUpdateUpdateMessage.payload);
        console.log(message);
        updateAd();
      }
    }
  );
}

function durationFormat(duration) {
  var p = "";
  duration = Math.floor(duration/1000);
  if(duration < 0) {
    duration = -1 * duration;
    p = "-";
  }
  return `${p}${Math.floor(duration/3600).toString().padStart(2, "0")}:${Math.floor((duration % 3600)/60).toString().padStart(2, "0")}:${(duration % 60).toString().padStart(2, "0")}`;
}

function startTimer() {
  return setInterval(() => {
    var [t, d, s, c] = !lastMessage ? simpleHandler() : lastHandler();
    if(t < (-300000 + d)) {
      updateTimer("--:--:--", timer_status_text.offline, /* LIGHT_MODE ? timer_status.offline_light :*/ timer_status.offline);
      return;
    }
    updateTimer(t > d ? durationFormat(t) : "00:00:00", s, c);
  }, 1000);
}

function simpleHandler() {
  var s,c;
  var t = (next - Date.now());
  if(t > 10*60000) {
    c = timer_status.standby;
  } else if(t > 60000) {
    c = timer_status.standby_near;
  } else {
    c = timer_status.active;
  }
  var d = -t*nextAd.durationSeconds*1000;
  if(t < 0 && t >= d) {
    s = `${timer_status_text.active}?`;
    t = d-t;
  } else {
    s = timer_status_text.standby;
  }
  return [t, d, s, c];
}

function lastHandler() {
  return simpleHandler();
}

function updateTimer(t, s, c) {
  w("p.content-timer-text").then(e => {
    e.forEach( i => {
      if(i.innerText != t) {
        i.innerText = t
      }
    });
  });
  w("p.content-status-text").then(e => {
    e.forEach(i => {
      if(timer_status_class != c) {
        i.classList.replace(timer_status_class, c);
        i.parentElement.classList.replace(timer_status_class, c);
        timer_status_class = c;
      }
      i.innerText = s;
      });
  });
}

function updateAd() {
  nextAd = message[0].data.user.adProperties.density.adSchedule[0];
  if(!nextAd) {
    nextAd = 0;
  }
  next = Date.parse(nextAd.runAtTime);
}


// Log `title` of current active web page
try {
const pageTitle = document.head.getElementsByTagName('title')[0].innerHTML;
} catch(e) {
  console.error(e);
  var pageTitle = "Something…?";
}
console.log(
  `Page title is: '${pageTitle}' - evaluated by Chrome extension's 'contentScript.js' file`
);

// Communicate with background file by sending a message
/*chrome.runtime.sendMessage(
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
});*/