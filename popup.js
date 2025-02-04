document.getElementById('tokenForm').addEventListener('submit', (event) => {
  event.preventDefault();
  
  const accessToken = document.getElementById('tokenField').value;

  if (!accessToken) {
    return;
  }

  chrome.storage.local.set({ github_token: accessToken }, async () => {
    console.log('GitHub token stored successfully!');
    displayPRs();
  });
});

async function displayPRs() {
  const prData = await chrome.runtime.sendMessage({ action: "fetchPRs" });
  console.log(prData);

  if (!prData) return;

  const list = document.getElementById('pr-list');
  list.innerHTML = '';
  prData.items.forEach(pr => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="${pr.html_url}" target="_blank">${pr.title}</a>`;
    list.appendChild(li);
  });


}

// Call fetchPRs if already authenticated
displayPRs();
