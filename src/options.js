import './options.scss';

var CHROME = (chrome.runtime && chrome.runtime.getURL);
_STORAGE = CHROME ? chrome.storage.local : storage.local;

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

function onClick(event) {
    try {
        event.preventDefault();
    } catch(e) {
        console.error(e);
    }
    var button = event.target;
    if(button.classList.contains("disabled")) {
      return;
    }
    var r = chrome.identity.getRedirectURL();
    console.log(r);
    chrome.identity.launchWebAuthFlow({
        interactive: true,
        url: `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=8gej984rx3ypt104fl0gkncne8z6sn&redirect_uri=${r}&scope=&state=c3ab8aa609ea11e793ae92361f002671`
    }, (a) => {
        fetch("https://jwihq12p96.execute-api.us-east-2.amazonaws.com/default/broadcaster/login", {
          "headers": {
            "content-type": "application/json"
          },
          "body": `{"token": "${a}"}`,
          "method": "POST"
        }).then(x => x.text()).then(async y => {
          console.log(y);
          r = JSON.parse(y);
          if(r.status == "error") {
            console.error(r);
          } else {
            storageSet({auth_token: r.auth_token});
            disableElement(button);
            var y = await getOptions(r);
            console.log(y);
            r = JSON.parse(y);
            if(r.status == "error") {
              console.error(r);
            } else {
              var [mods_only, auto_allow_mods] = await updateCheckboxes(r);
              checkboxEnable(mods_only);
              checkboxEnable(auto_allow_mods);
            }
          }
        });
    });
}

function updateCheckboxes(r) {
  var mods_only = document.getElementById("checkbox-mods-only");
  var auto_allow_mods = document.getElementById("checkbox-mods-auto");
  mods_only.checked = r.response.mods_only;
  auto_allow_mods.checked = r.response.auto_allow_mods;
  return [mods_only, auto_allow_mods];
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

function getOptions(x) {
  return new Promise((resolve, reject) => {
    fetch("https://jwihq12p96.execute-api.us-east-2.amazonaws.com/default/broadcaster/options", {
        "headers": {
          "content-type": "application/json",
          "Authorisation": x["auth_token"]
        },
        "method": "GET"
      }).then(x => x.text()).then(y => {
        resolve(y);
      }).catch(e => {
        reject(e);
      });
  })
}

function propertyHandler(prop) {
  return async (event) => {
    var x = await storageGet(["auth_token"]);
    if(!("auth_token" in x)) {
      console.error("Missing auth token");
    }
    var enabled = event.target.checked ? "true" : "false";
    fetch(`https://jwihq12p96.execute-api.us-east-2.amazonaws.com/default/broadcaster/options?action=edit&${prop}=${enabled}`, {
      "headers": {
        "content-type": "application/json",
        "Authorisation": x["auth_token"]
      },
      "method": "GET"
    }).then(x => x.text()).then(y => {
      console.log(y);
      var r = JSON.parse(y);
      if(r.status == "error") {
        console.error(r);
      } else {
        updateCheckboxes(r);
      }
    });
  };
}

async function disableElement(e) {
  e.classList.add("disabled");
  e.disabled = true;
}

async function enableElement(e) {
  e.classList.remove("disabled");
  e.disabled = false;
}

async function checkboxDisable(e) {
  disableElement(e);
  disableElement(e.parentElement.parentElement);
}

async function checkboxEnable(e) {
  enableElement(e);
  enableElement(e.parentElement.parentElement);
}

w("#signin-test").then(async e => {
    //onClick(null);
    var i = e[0];
    i.addEventListener("click", onClick);
    var x = await storageGet(["auth_token"]);
    if("auth_token" in x) {
      disableElement(i);
      getOptions(x).then(y => {
        console.log(y);
        var r = JSON.parse(y);
        if(r.status == "error") {
          console.error(r);
        } else {
          var [mods_only, auto_allow_mods] = updateCheckboxes(r);
          mods_only.addEventListener("change", propertyHandler("mods_only"));
          auto_allow_mods.addEventListener("change", propertyHandler("auto_allow_mods"));
        }
      })
    } else {
      checkboxDisable(document.getElementById("checkbox-mods-only"));
      checkboxDisable(document.getElementById("checkbox-mods-auto"));
    }
});