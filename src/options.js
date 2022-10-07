import './options.scss';

var CHROME = (chrome.runtime && chrome.runtime.getURL);
var _STORAGE = CHROME ? chrome.storage.local : storage.local;
var _IDENTITY = CHROME ? chrome.identity : browser.identity;

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
    var r = _IDENTITY.getRedirectURL();
    console.log(r);
    _IDENTITY.launchWebAuthFlow({
        interactive: true,
        url: `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=8gej984rx3ypt104fl0gkncne8z6sn&redirect_uri=${r}&scope=moderation:read`
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
            storageSet({auth_token: r.auth_token, username: r.username, user_id: r.user_id});
            disableElement(button);
            getOptions(r).then(async y => {
              console.log(y);
              var r = JSON.parse(y);
              if(r.status == "error") {
                console.error(r);
              } else {
                var [mods_only, auto_allow_mods] = await updateCheckboxes(r);
                checkboxEnable(mods_only);
                checkboxEnable(auto_allow_mods);
              }
            });
            getUsers(r).then(y => {
              if(y.status == "error" || !y.status) {
                console.error(y);
              } else {
                var allowed_users = document.getElementById("allowed-users-list");
                updateList(y.response, allowed_users, listRemoveHandler);
                enableElement(allowed_users.parentElement.parentElement);
                enableElement(document.getElementById("allow-user-input"));
                enableElement(document.getElementById("allow-user-button"));
                enableElement(document.getElementById("setup-user-input"));
                enableElement(document.getElementById("setup-user-button"));
                enableElement(document.getElementById("setup-users-list").parentElement.parentElement);
              }
            })
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

function getEntry(i, t, h) {
  var li = document.createElement("li");
  var button = document.createElement("button");
  var p = document.createElement("p");
  p.className = "list-user-entry";
  p.innerText = i;
  button.addEventListener("click", h);
  button.innerText = t;
  li.insertAdjacentElement("afterbegin", p);
  li.insertAdjacentElement("beforeend", button);
  return li;
}

function updateList(r, e, h) {
  for(var i = 0; i < r.length; i++) {
    e.appendChild(getEntry(r[i], "Remove", h));
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

function storageRemove(i) {
  return _STORAGE.remove(i);
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

function getUsers(x) {
  return new Promise((resolve, reject) => {
    fetch("https://jwihq12p96.execute-api.us-east-2.amazonaws.com/default/broadcaster/allowed_users", {
      "headers": {
        "content-type": "application/json",
        "Authorisation": x["auth_token"]
      },
      "method": "GET"
    }).then(x => x.text()).then(y => {
      resolve(JSON.parse(y));
    }).catch(e => {
      reject(e);
    });
  })
}

function editUser(x, a, u) {
  return new Promise((resolve, reject) => {
    fetch(`https://jwihq12p96.execute-api.us-east-2.amazonaws.com/default/broadcaster/allowed_users?action=${a}&username=${u}`, {
      "headers": {
        "content-type": "application/json",
        "Authorisation": x["auth_token"]
      },
      "method": "GET"
    }).then(x => x.text()).then(y => {
      resolve(JSON.parse(y));
    }).catch(e => {
      reject(e);
    });
  });
}

function userLogin(x, t) {
  return new Promise((resolve, reject) => {
    fetch(`https://jwihq12p96.execute-api.us-east-2.amazonaws.com/default/user/login?broadcaster=${t}`, {
      "headers": {
        "content-type": "application/json",
        "Authorisation": x["auth_token"]
      },
      "method": "GET"
    }).then(x => x.text()).then(y => {
      resolve(JSON.parse(y));
    }).catch(e => {
      reject(e);
    });
  });
}

async function listRemoveHandler(event) {
  disableElement(event.target);
  var item = event.target.parentElement;
  var user = item.getElementsByClassName("list-user-entry")[0].innerText;
  var x = await storageGet(["auth_token"]);
  var r = await editUser(x, "remove", user);
  enableElement(event.target);
  if(r.status == "error" || !r.status) {
    console.error(r);
  } else {
    item.remove();
  }
}

async function allowUserHandler(event) {
  var input = document.getElementById("allow-user-input");
  var username = input.value;
  disableElement(event.target);
  disableElement(input);
  var x = await storageGet(["auth_token"]);
  var r = await editUser(x, "add", username);
  if(r.status == "error" || !r.status) {
    console.error(r);
  } else {
    input.value = "";
    document.getElementById("allowed-users-list").appendChild(getEntry(r.username, "Remove", listRemoveHandler));
  }
  enableElement(event.target);
  enableElement(input);
}

function listButtonStateChange(list, h) {
  var e = list.getElementsByTagName("button");
  for(var i = 0; i < e.length; i++) {
    h(e[i]);
  }
}

async function setupListRemoveHandler(event) {
  var list = event.target.parentElement.parentElement;
  listButtonStateChange(list, disableElement);
  disableElement(event.target);
  var item = event.target.parentElement;
  var user = item.getElementsByClassName("list-user-entry")[0].innerText;
  var users = (await storageGet(["setup_users"]))["setup_users"];
  delete users[user];
  await storageSet({"setup_users": users});
  event.target.parentElement.remove();
  listButtonStateChange(list, enableElement);
}

async function setupUserHandler(event) {
  var user_list = document.getElementById("setup-users-list");
  var input = document.getElementById("setup-user-input");
  var username = input.value;
  disableElement(event.target);
  disableElement(input);
  listButtonStateChange(user_list, disableElement);
  var x = await storageGet(["auth_token", "setup_users"]);
  if("setup_users" in x && username in x["setup_users"]) {
    console.error(`User ${username} already setup`);
    input.value = "";
  } else {
    var r = await userLogin(x, username);
    if(r.status == "error" || !r.status) {
      console.error(r);
    } else {
      var users = "setup_users" in x ? x["setup_users"] : {};
      users[r.username] = {"auth_token": r.auth_token, "user_id": r.user_id};
      await storageSet({"setup_users": users});
      user_list.appendChild(getEntry(r.username, "Remove", setupListRemoveHandler));
      input.value = "";
    }
  }
  listButtonStateChange(user_list, enableElement);
  enableElement(event.target);
  enableElement(input);
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
      if(r.status == "error" || !r.status) {
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
    document.getElementById("allow-user-button").addEventListener("click", allowUserHandler);
    var x = await storageGet(["auth_token"]);
    if("auth_token" in x) {
      disableElement(i);
      getOptions(x).then(y => {
        console.log(y);
        var r = JSON.parse(y);
        if(r.status == "error" || !r.status) {
          console.error(r);
        } else {
          var [mods_only, auto_allow_mods] = updateCheckboxes(r);
          mods_only.addEventListener("change", propertyHandler("mods_only"));
          auto_allow_mods.addEventListener("change", propertyHandler("auto_allow_mods"));
        }
      });
      getUsers(x).then(y => {
        if(y.status == "error" || !y.status) {
          console.error(y);
        } else {
          var allowed_users = document.getElementById("allowed-users-list");
          updateList(y.response, allowed_users, listRemoveHandler);
        }
      });
      storageGet(["setup_users"]).then(y => {
        if("setup_users" in y) {
          var list = document.getElementById("setup-users-list");
          updateList(Object.keys(y["setup_users"]), list, setupListRemoveHandler);
        }
        document.getElementById("setup-user-button").addEventListener("click", setupUserHandler);
      });
    } else {
      checkboxDisable(document.getElementById("checkbox-mods-only"));
      checkboxDisable(document.getElementById("checkbox-mods-auto"));
      disableElement(document.getElementById("allowed-users-list").parentElement.parentElement);
      disableElement(document.getElementById("allow-user-input"));
      disableElement(document.getElementById("allow-user-button"));
      disableElement(document.getElementById("setup-user-input"));
      disableElement(document.getElementById("setup-user-button"));
      disableElement(document.getElementById("setup-users-list").parentElement.parentElement);
    }
});