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
  if (!response.ok) {
    if (response.status === 401) {
      // Log the user out as their token is probably expired
      logout(true);
    }
    return;
  }
  const userData = await response.json();

  const reviewRequestsResponse = await fetch(`https://api.github.com/search/issues?q=review-requested:${userData.login}+is:pr+state:open`, {
    headers: { Authorization: `token ${githubToken}` }
  })
  if (!reviewRequestsResponse.ok) {
    if (reviewRequestsResponse.status === 401) {
      logout(true);
    }
    return;
  }
  const reviewRequestsData = await reviewRequestsResponse.json();

  const openPrsResponse = await fetch(`https://api.github.com/search/issues?q=author:${userData.login}+is:pr+state:open`, {
    headers: { Authorization: `token ${githubToken}` }
  })
  if (!openPrsResponse.ok) {
    if (openPrsResponse.status === 401) {
      logout(true);
    }
    return;
  }
  const openPrsData = await openPrsResponse.json();

  const lastPrUpdate = new Date();

  const badgeText = `${formatItemsNum(reviewRequestsData.total_count)}|${formatItemsNum(openPrsData.total_count)}`;
  chrome.action.setBadgeText({text: badgeText});

  // Set badge color to yellow if there are review requests, otherwise black
  const badgeColor = reviewRequestsData.total_count > 0 ? '#FFA500' : 'black';
  chrome.action.setBadgeBackgroundColor({color: badgeColor});

  await chrome.storage.local.set({
    reviewRequestsData,
    openPrsData,
    lastPrUpdate: lastPrUpdate.toString()
  })

  chrome.runtime.sendMessage({ action: "PrsRefreshed" });

}

async function logout(failure = false) {
  await chrome.storage.local.clear()
  if (failure) {
    chrome.action.setBadgeText({text: '?'});
    chrome.action.setBadgeBackgroundColor({color: 'red'});
  } else {
    chrome.action.setBadgeText({ text: "" });
    chrome.action.setBadgeBackgroundColor({ color: [0, 0, 0, 0] });
  }

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
  chrome.contextMenus.create({
    id: "logout",
    title: "Logout",
    contexts: ["action"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "logout") {
    logout();
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === PR_REFRESH_ALARM_NAME) {
    fetchPrs();
  }
});
