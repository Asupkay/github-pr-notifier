const tokenForm = document.getElementById('tokenForm');
const loginBlock = document.getElementById('loginBlock');
const prList = document.getElementById('prList');
const prBlock = document.getElementById('prBlock');
const noPrsBlock = document.getElementById('noPrsBlock');
const lastPrUpdateDisplay = document.getElementById('lastPrUpdate');
const errorMessage = document.getElementById("errorMessage");

document.getElementById("refreshIcon").addEventListener('click', (event) => {
  chrome.runtime.sendMessage({ action: "refreshPrs" })
});

tokenForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const accessToken = document.getElementById('tokenField').value;

  if (!accessToken) {
    showError('Field must not be empty')
    return;
  }

  await chrome.storage.local.set({ github_token: accessToken })

  if (await checkGithubTokenValidity(accessToken)) {
    errorMessage.style.display = "none";
    checkLoginStatus();
    return;
  }

  showError('Token is not valid');
});

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = "block";
}

async function displayPrs() {
  const { prData } = await chrome.storage.local.get(['prData']);

  if (!prData || prData.items.length === 0) {
    prList.style.display = 'none';
    noPrsBlock.style.display = 'block';
    return;
  }

  noPrsBlock.style.display = 'none';
  prList.style.display = 'block';
  prList.innerHTML = '';
  prData.items.forEach(pr => {
    const div = document.createElement('div');
    console.log(pr);
    div.innerHTML = `<a href="${pr.html_url}" target="_blank">${pr.title}</a>`;
    prList.appendChild(div);
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
    loginBlock.style.display = 'block';
    prBlock.style.display = 'none';
    return;
  } 
  loginBlock.style.display = 'none';
  prBlock.style.display = 'block';
  displayTime();
  displayPrs();
  await chrome.runtime.sendMessage({ action: "refreshPrs" })
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PrsRefreshed") {
    displayPrs();
    return false;
  }
  if (request.action === "Logout") {
    checkLoginStatus();
    return false;
  }
});

async function checkGithubTokenValidity(token) {
  try {
    const response = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    
    if (response.ok) {
      return true;
    }

    if (response.status === 401) {
      return false;
    }

    throw new Error('Error checking token validity');
  } catch (error) {
    console.log(error);
    return false;
  }
}

checkLoginStatus();
