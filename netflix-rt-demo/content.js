// content.js
const processedTitles = new Set();
const DETAIL_PAGE_BADGE_CONTAINER_CLASS = "rt-detail-badges-container"; // New class for our badge container

function fetchRating(title) {
  return new Promise(resolve => {
    try {
      chrome.runtime.sendMessage({ action: "fetchRating", title }, response => {
        if (chrome.runtime.lastError) {
          console.error("Extension messaging error:", chrome.runtime.lastError.message);
          return resolve(null);
        }
        if (response && response.data) resolve(response.data);
        else {
          console.error("Failed to fetch rating:", response?.error);
          resolve(null);
        }
      });
    } catch (err) {
      console.error("Extension context invalidated during sendMessage:", err.message);
      resolve(null);
    }
  });
}

function createBadgeElement(source, value, typeClass, positionStyles = {}) {
  const badge = document.createElement("div");
  badge.className = `rt-badge rt-badge-${source.replace(/\s+/g, '')} ${typeClass}`;

  const icon = document.createElement("img");
  icon.style.width = "16px";
  icon.style.height = "16px";
  icon.style.marginRight = "4px";
  
  // Set icon URL (official logos from web)
  if (source === "Rotten Tomatoes") icon.src = "https://upload.wikimedia.org/wikipedia/commons/5/5b/Rotten_Tomatoes.svg";
  else if (source === "Metacritic") icon.src = "https://upload.wikimedia.org/wikipedia/commons/2/20/Metacritic.svg";
  else if (source === "Internet Movie Database") icon.src = "https://upload.wikimedia.org/wikipedia/commons/6/69/IMDB_Logo_2016.svg";

  badge.appendChild(icon);

  const text = document.createElement("span");
  text.innerText = value;
  badge.appendChild(text);

  badge.style.background = "#030303ff"; // Netflix red
  badge.style.color = "#fff";
  badge.style.padding = "2px 6px";
  badge.style.borderRadius = "4px";
  badge.style.fontSize = "12px";
  badge.style.fontWeight = "bold";
  badge.style.display = "inline-flex";
  badge.style.alignItems = "center";

  Object.assign(badge.style, positionStyles);
  return badge;
}


async function processBrowseTitle(titleEl) {
  const titleText = titleEl.innerText.trim();
  // Find a suitable parent that can be made relative for badge positioning
  const parentContainer = titleEl.closest(".title-card, .billboard-card, .video-card-container");

  if (!titleText || processedTitles.has(titleText) || !parentContainer || parentContainer.querySelector(".rt-badge-browse")) {
    return; // Already processed or no suitable container/title
  }

  processedTitles.add(titleText);
  const data = await fetchRating(titleText);

if (data?.ratings) {
  let topOffset = 8;
  for (const [source, value] of Object.entries(data.ratings)) {
    if (value && value !== "N/A") {
      const badge = createBadgeElement(
        source,
        value,
        "rt-badge-browse",
        { position: "absolute", top: `${topOffset}px`, left: "8px", zIndex: "10" }
      );
      parentContainer.style.position = "relative"; // Ensure parent is relative
      parentContainer.appendChild(badge);
      topOffset += 22; // space between stacked badges
      console.log(`Browse Badge added for: ${titleText} - ${source}: ${value}`);
    }
  }
}

  if (data?.ratings && data.ratings["Rotten Tomatoes"]) {
    const rtRating = data.ratings["Rotten Tomatoes"];
    const badge = createBadgeElement(
      "Rotten Tomatoes",
      rtRating,
      "rt-badge-browse"
    );
    parentContainer.style.position = "relative"; // Ensure parent is relative
    parentContainer.appendChild(badge);
    console.log("Browse Badge added for:", titleText, rtRating);
  }
}

async function processDetailPage(detailTitleEl) {
    // Find the closest common ancestor that we can use to append our badges,
    // and where we can check if badges are already present.
    // This often involves looking for the modal itself or a section within it.
    const detailViewContainer = detailTitleEl.closest(".previewModal--details-wrapper, .videoPlayer-details");

    if (!detailViewContainer || detailViewContainer.querySelector(`.${DETAIL_PAGE_BADGE_CONTAINER_CLASS}`)) {
        return; // Badges already added to this detail view, or no suitable container
    }

    const title = detailTitleEl.innerText.trim();
    if (!title) return;

    const data = await fetchRating(title);
    if (!data || !data.ratings || Object.keys(data.ratings).length === 0) return;

    // Create a container for all badges on the detail page to manage positioning
    const badgesContainer = document.createElement("div");
    badgesContainer.className = DETAIL_PAGE_BADGE_CONTAINER_CLASS;
    badgesContainer.style.display = "flex";
    badgesContainer.style.gap = "8px"; // Space between badges
    badgesContainer.style.marginTop = "10px"; // Space below the title/logo

    let positionOffset = 0; // For future complex positioning if needed

    for (const [source, value] of Object.entries(data.ratings)) {
        if (value && value !== "N/A") { // Only add if rating exists
            const badge = createBadgeElement(source, value, "rt-badge-detail");
            badgesContainer.appendChild(badge);
            console.log(`Detail Badge added for: ${title} - ${source}: ${value}`);
        }
    }

    // Find the right spot to insert the badges container.
    // This often requires inspecting Netflix's DOM structure.
    // Let's try to insert it near the title/logo in the detail modal.
    // Common Netflix modal title containers:
    // .previewModal--player-titleTreatment, .title-info, .videoPlayer--details-wrapper
    const insertionPoint = detailTitleEl.closest(".previewModal--player-titleTreatment, .title-info, .videoPlayer--details-wrapper");

    if (insertionPoint) {
        // Insert our badges container *after* the title element within its parent,
        // or a logical sibling element.
        // A common strategy is to insert it after the element that contains the title text/logo.
        const titleParent = detailTitleEl.parentElement;
        if (titleParent) {
             titleParent.appendChild(badgesContainer);
        } else {
            insertionPoint.appendChild(badgesContainer);
        }
    } else {
        console.warn("Could not find a suitable insertion point for detail page badges.");
        // Fallback: append to the main container if no specific spot found
        detailViewContainer.appendChild(badgesContainer);
    }
}


function observeNetflix() {
  let timeoutId;
  const observer = new MutationObserver(async (mutations) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      // --- Logic for main Netflix browse/home page titles ---
      const browseTitleEls = document.querySelectorAll(
        ".title-titleText, .fallback-text, .bob-title"
      );
      for (const titleEl of browseTitleEls) {
        await processBrowseTitle(titleEl);
      }

      // --- Logic for detail page (modal or dedicated detail page) ---
      const detailTitleEl = document.querySelector(
        ".previewModal--player-titleTreatment-logo, .title-titleText, .previewModal--title-treatment, .fallback-text"
      );
      // Ensure we target a title that is part of a visible detail modal/page,
      // and not one of the browse page titles that might also match the selector
      if (detailTitleEl && detailTitleEl.closest(".previewModal, .videoPlayer-details")) {
        await processDetailPage(detailTitleEl);
      }

    }, 500); // Debounce time
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Run the observer
observeNetflix();
//end content.js