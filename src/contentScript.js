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
var USER_REGEX = /https:\/\/(?:www.)?twitch.tv\/(?:popout\/)?moderator\/([a-zA-Z_0-9]{3,})(?:\/.*)?$/i;
var IS_CHROME = (chrome.runtime && chrome.runtime.getURL);
var _STORAGE = IS_CHROME ? chrome.storage.local : storage.local;
var AUTH_TOKEN = false;
var HANDLER = false;
var TIMER = -1;
var SETUP_USERS = false;
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

var message = false; //
var lastMessage = false; // message

var timer_status = {
  standby: "timer-status-standby",
  standby_near: "timer-status-standby-near",
  active: "timer-status-active",
  offline: "timer-status-offline",
  //offline_light: "timer-status-offline-light"
  disabled: "timer-status-offline"
};

var timer_status_text = {
  standby: "STANDBY",
  standby_near: "STANDY",
  active: "ACTIVE",
  offline: "OFFLINE",
  disabled: "DISABLED"
};

async function broadcasterHandler() {
  w("button[data-highlight-selector=\"run-ad-button\"]").then(e => { e.forEach(i => { i.addEventListener("click", update, false); }); });
  w("button[data-highlight-selector=\"snooze-button\"]").then(e => { e.forEach(i => { i.addEventListener("click", update, false); }); });

  var x = await storageGet(["auth_token", "user_id"]);
  if(!("auth_token" in x)) {
    console.log("Missing authorization token.\nReturning.");
    HANDLER = false;
    return;
  }
  if(!("user_id" in x)) {
    console.error("Missing user_id.\nReturning.");
    HANDLER = false;
    return;
  }
  AUTH_TOKEN = x["auth_token"];
  HANDLER = true;
  USERID = x["user_id"]

  //console.log("asadfasddasasd")
  try {
    //console.log("asadfasddasasd2")
    API.graphql(graphqlOperation(createUpdateMessage, {input: { userid: USERID, payload: "{}"}}, AUTH_TOKEN)).then(() => {
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
    API.graphql(graphqlOperation(updateUpdateMessage, {input: message}, AUTH_TOKEN)).then(e => {
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

function storageGet(i) {
  return new Promise((resolve, reject) => {
    try {
      _STORAGE.get(i, function(x) {
        resolve(x);
      });
    } catch(e) {
      reject(e);
    }
  });
}

function storageSet(i) {
  return _STORAGE.set(i);
}

_STORAGE.onChanged.addListener((event) => {
  if(!("auth_token" in event)) {
    return;
  }
  AUTH_TOKEN = event["auth_token"].newValue;
  if(!HANDLER) {
    if(broadcasterPage()) {
      broadcasterHandler();
    } else {
      modHandler().then(i => { TIMER = i });
    }
  }
});

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
  return (IS_CHROME ? chrome.runtime.getURL(url) : browser.runtime.getURL(url));
}

async function modHandler(broadcasterName) {
  try {
    var content = getURL("/content.html");
  } catch(e) {
    var content = "content.html";
    debugger;
  }
  var token = await storageGet(["auth_token", "setup_users"]);
  if(!(["auth_token"] in token)) {
    console.log("Missing authorization token.\nReturning.");
    HANDLER = false;
    return;
  }
  if(!(["setup_users" in token])) {
    console.log("No setup users found.\nReturning.");
    HANDLER = false;
    return;
  }
  if(!(broadcasterName in token["setup_users"])) {
    console.log(`Broadcaster ${broadcasterName} not setup.`);
    HANDLER = false;
    return;
  }
  HANDLER = true;
  var user = token["setup_users"][broadcasterName]
  AUTH_TOKEN = user["auth_token"];
  USERID = user["user_id"];
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

async function broadcasterPage() {
  var m = document.location.href.match(USER_REGEX);
  if(!m || m.length < 1) {
    console.log(m);
    throw new Error("Invalid location detected");
  }
  var broadcaster = m[1];
  try {
    var user = (await storageGet(["username"]))["username"];
  } catch(e) {
    console.log("Please login with Twitch to start using the adForwarder extension");
    throw e;
  }
  return [broadcaster, (broadcaster == user)]; //BROADCASTER
}

broadcasterPage().then(([broadcasterName, broadcaster]) => {
  if(broadcaster) {
    console.log("Starting broadcaster handler.");
    broadcasterHandler();
  } else {
    console.log("Starting mod handler.");
    modHandler(broadcasterName).then(i => { TIMER = i });
  }
});

function getMessage(userid) {
  API.graphql({ query: getUpdateMessage, variables: {userid: userid}, authToken: AUTH_TOKEN}).then((m) => {
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
  API.graphql(graphqlOperation(onUpdateUpdateMessage, {userid: userid}, AUTH_TOKEN)).subscribe(
    {
      next: (m) => {
        var t = JSON.parse(m.value.data.onUpdateUpdateMessage.payload);
        if(message[0].extensions.requestID == t[0].extensions.requestID) {
          console.log("Repeated message received!");
          console.log(message);
          console.log(t);
          return;
        }
        lastReceived = Date.now();
        lastMessage = message;
        message = t;
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
    if(!message) {
      return;
    }
    try {
      var [t, d, s, c] = !lastMessage ? simpleHandler() : lastHandler();
    } catch(e) {
      if((e instanceof adScheduleDisabled)) {
        updateTimer("--:--:--", timer_status_text.disabled, timer_status.disabled);
      }
      else {
        throw e;
      }
    }
    if(t < (-300000 + d)) {
      updateTimer("--:--:--", timer_status_text.offline, /* LIGHT_MODE ? timer_status.offline_light :*/ timer_status.offline);
      return;
    }
    updateTimer(t > d ? durationFormat(t) : "00:00:00", s, c);
  }, 1000);
}

function simpleHandler() {
  if(!message[0].data.user.adProperties.density.isAdScheduleEnabled) {
    throw new adScheduleDisabled();
  }
  var s,c;
  var t = (next - Date.now());
  if(t > 10*60000) {
    c = timer_status.standby;
  } else if(t > 60000) {
    c = timer_status.standby_near;
  } else {
    c = timer_status.active;
  }
  var d = -1*nextAd.durationSeconds*1000;
  if(t < 0 && t >= d) {
    s = `${timer_status_text.active}?`;
    t = d-t;
  } else {
    s = timer_status_text.standby;
  }
  return [t, d, s, c];
}

function lastHandler() {
  var m = message[0].data.user.adProperties.density;
  var l = lastMessage[0].data.user.adProperties.density;
  if(!m.isAdScheduleEnabled) {
    throw new adScheduleDisabled("New message contains a disabled ad schedule");
  }
  if(!l.isAdScheduleEnabled) {
    return simpleHandler();
  }
  var interval = m.interval.desiredSeconds;
  var diff = (Date.parse(m.adSchedule[0].runAtTime) - Date.parse(l.adSchedule[0].runAtTime))/interval;
  var d = -1 * diff * nextAd.durationSeconds;
  if(diff == 0) {
    return simpleHandler();
  } else {
    var t = d + (Date.now() - lastReceived);
    var s = timer_status_text.active;
    var c = timer_status.active;
    if(t >= 0) {
      lastMessage = false;
    }
    return [t, d, s, c];
  }
}

function updateTimer(t, s, c) {
  w("p.content-timer-text").then(e => {
    e.forEach( i => {
      return i.innerText = t;
    });
  });
  w("p.content-status-text").then(e => {
    e.forEach(i => {
      if(timer_status_class != c) {
        i.classList.replace(timer_status_class, c);
        i.parentElement.classList.replace(timer_status_class, c);
        timer_status_class = c;
      }
      if(i.innerText != s) {
        i.innerText = s;
      }
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

class adScheduleDisabled extends Error {
  constructor(message = "", ...args) {
    super(message, ...args);
    Object.setPrototypeOf(this, adScheduleDisabled.prototype);
  }
}