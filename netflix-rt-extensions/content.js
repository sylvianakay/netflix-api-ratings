// Fetch rating from background.js
import chrome from 'chrome';
function fetchRating(title) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ action: "fetchRating", title }, response => {
      if (response && response.data) resolve(response.data);
      else {
        console.error("Failed to fetch rating:", response?.error);
        resolve(null);
      }
    });
  });
}


// Observe Netflix grid and inject ratings
function observeNetflix() {
  const observer = new MutationObserver(async () => {
    const titleEls = document.querySelectorAll(
      ".title-titleText, .fallback-text, .previewModal--title-treatment, .bob-title"
    );

    titleEls.forEach(async titleEl => {
      if (!titleEl.parentElement.querySelector(".rt-badge")) {
        const title = titleEl.innerText.trim();
        const data = await fetchRating(title); // <-- call here
        if (data && data.rottenTomatoes && data.rottenTomatoes !== "N/A") {
          const badge = document.createElement("div");
          badge.className = "rt-badge";
          badge.innerText = `🍅 ${data.rottenTomatoes}`;
          badge.style.background = "#e50914";
          badge.style.color = "#fff";
          badge.style.padding = "2px 4px";
          badge.style.borderRadius = "3px";
          badge.style.fontSize = "12px";
          badge.style.position = "absolute";
          badge.style.top = "4px";
          badge.style.left = "4px";
          titleEl.parentElement.style.position = "relative";
          titleEl.parentElement.appendChild(badge);
          console.log("Badge added for:", title);
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// Inject badge on detail page
async function injectDetailPage() {
  const titleEl = document.querySelector(
    ".previewModal--player-titleTreatment-logo, .title-titleText, .previewModal--title-treatment, .fallback-text"
  );
  if (!titleEl) return;

  const title = titleEl.innerText.trim();
  const data = await fetchRating(title);
  if (data && data.rottenTomatoes && data.rottenTomatoes !== "N/A") {
    const badge = document.createElement("div");
    badge.className = "rt-badge";
    badge.innerText = `🍅 ${data.rottenTomatoes}`;
    badge.style.marginTop = "4px";
    titleEl.parentElement.appendChild(badge);
  }
}

// Run both
observeNetflix();
injectDetailPage();
