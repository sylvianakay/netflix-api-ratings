// background.js
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === "fetchRating" && msg.title) {
    fetch(`http://localhost:3001/movie/${encodeURIComponent(msg.title)}`)
      .then(res => res.json())
      .then(data => sendResponse({ data }))
      .catch(err => sendResponse({ data: null, error: err.message }));
    return true; // keep sendResponse valid asynchronously
  }
});
