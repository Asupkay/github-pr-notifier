const PR_REFRESH_ALARM_NAME = 'pr-refesh-alarm';

async function fetchPrs() {
  const { github_token: githubToken } = await chrome.storage.local.get(['github_token']);
  if (!githubToken) return;

  const response = await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      Authorization: `token ${githubToken}`,
    }
  })
  console.log(response);
  if (!response.ok) {
    if (response.status === 401) {
      // Log the user out as their token is probably expired
      console.log("there");
      logout();
    }
    return;
  }
  const userData = await response.json();

  const prResponse = await fetch(`https://api.github.com/search/issues?q=review-requested:${userData.login}+is:pr+state:open`, {
    headers: { Authorization: `token ${githubToken}` }
  })
  console.log(prResponse);
  if (!prResponse.ok) {
    if (prResponse.status === 401) {
      console.log("here");
      logout();
    }
    return;
  }
  const lastPrUpdate = new Date();
  const prData = await prResponse.json();

  chrome.action.setBadgeText({text: formatItemsNum(prData.items.length)});
  chrome.action.setBadgeBackgroundColor({color: 'black'});

  await chrome.storage.local.set({ prData, lastPrUpdate: lastPrUpdate.toString() })

  chrome.runtime.sendMessage({ action: "PrsRefreshed" });
  return prData;

}

async function logout() {
  await chrome.storage.local.remove('github_token')
  chrome.action.setBadgeText({text: '?'});
  chrome.action.setBadgeBackgroundColor({color: 'red'});
  chrome.runtime.sendMessage({ action: "Logout" });
}

function formatItemsNum(amountOfItems) {
  if (amountOfItems > 999) {
    return '999+';
  }
  return amountOfItems.toString();
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "refreshPrs") {
    fetchPrs().then(sendResponse);
    return true;
  }
});

async function ensureAlarmExists() {
  const alarm = await chrome.alarms.get(PR_REFRESH_ALARM_NAME);

  if (!alarm) {
    await chrome.alarms.create(PR_REFRESH_ALARM_NAME, { periodInMinutes: 1 });
  }
}

chrome.runtime.onStartup.addListener(() => {
  ensureAlarmExists();
});

chrome.runtime.onInstalled.addListener(() => {
  fetchPrs();
  ensureAlarmExists();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === PR_REFRESH_ALARM_NAME) {
    fetchPrs();
  }
});
