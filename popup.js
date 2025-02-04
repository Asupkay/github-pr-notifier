const tokenForm = document.getElementById('tokenForm');
const prList = document.getElementById('prList');
const prBlock = document.getElementById('prBlock');
const noPrsBlock = document.getElementById('noPrsBlock');
const lastPrUpdateDisplay = document.getElementById('lastPrUpdate');

tokenForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const accessToken = document.getElementById('tokenField').value;

  if (!accessToken) {
    return;
  }

  await chrome.storage.local.set({ github_token: accessToken })

  console.log('GitHub token stored successfully!');
  checkLoginStatus();
});

async function displayPrs() {
  const { lastPrUpdate, prData } = await chrome.storage.local.get(['lastPrUpdate', 'prData']);

  if (!prData) {
    prList.display.style = 'none';
    noPrsBlock.display.style = 'block';
    return;
  }

  noPrsBlock.display.style = 'none';
  prList.display.style = 'block';
  prList.innerHTML = '';
  prData.items.forEach(pr => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${pr.html_url}" target="_blank">${pr.title}</a>`;
    prList.appendChild(li);
  });

}

function getTimeSince(date) {
  const now = new Date();
  const then = new Date(date);

  // Get the difference in milliseconds
  const diff = now.getTime() - then.getTime();

  // Convert to seconds, minutes, hours, days, etc. as needed
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  // Return the desired format
  if (days > 0) {
    return `More than a day ago`;
  } else if (hours > 0) {
    return `Less than a day ago`;
  } else if (minutes > 0) {
    return `Less than an hour ago`;
  } else if (seconds > 15) {
    return `Less than a minute ago`;
  } else if (seconds > 2) {
    return `A few seconds ago`;
  } else {
    return 'Just now'
  }
}

async function displayTime() {
  const { lastPrUpdate } = await chrome.storage.local.get(['lastPrUpdate']);
  if (!lastPrUpdate) return;

  lastPrUpdateDisplay.innerText = getTimeSince(new Date(lastPrUpdate));
}

setInterval(displayTime, 1000);

async function checkLoginStatus() {
  const { github_token: githubToken } = await chrome.storage.local.get(['github_token']);
  //const githubToken = null;
  if (!githubToken) {
    tokenForm.style.display = 'block';
    prBlock.style.display = 'none';
    return;
  } 
  tokenForm.style.display = 'none';
  prBlock.style.display = 'block';
  displayTime();
  await chrome.runtime.sendMessage({ action: "refreshPrs" })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PrsRefreshed") {
    displayPrs();
    return true;
  }
});

checkLoginStatus();
