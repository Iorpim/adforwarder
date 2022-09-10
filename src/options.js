import './options.scss';

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
    var r = chrome.identity.getRedirectURL();
    console.log(r);
    chrome.identity.launchWebAuthFlow({
        interactive: true,
        url: `https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=8gej984rx3ypt104fl0gkncne8z6sn&redirect_uri=${r}&scope=moderation%3Aread%20user%3Aread%3Aemail&state=c3ab8aa609ea11e793ae92361f002671`
    }, (a) => {
        console.log(a);
    })
}

w("#signin-test").then(e => {
    //onClick(null);
    e.forEach(i => {
        i.onClick = onClick;
        i.addEventListener("click", onClick);
    });
});