# 🎬 Netflix Ratings Extension

An elegant and powerful Chrome extension that enriches your Netflix experience by displaying ratings from popular sources like **Rotten Tomatoes**, **IMDb**, and **Metacritic** directly within the Netflix UI. Say goodbye to switching tabs to check a movie's score!

## ✨ Key Features

* **Integrated Ratings:** Instantly see movie and show ratings at a glance.
* **Multi-Source Support:** Get scores from the most trusted rating platforms—Rotten Tomatoes, IMDb, and Metacritic—all in one place.
* **Seamless UI Integration:** Our custom-designed badges blend perfectly with the Netflix interface, appearing on both the main browse page and the detailed modal views.

## 🚀 Getting Started

This project is a full-stack solution, combining a Chrome extension with a local Node.js backend. Follow these simple steps to set it up.

### Step 1: Backend Server Setup ⚙️

The backend acts as the bridge, fetching ratings from the OMDb API.

* **Prerequisites:** You'll need [Node.js](https://nodejs.org/) installed on your machine.
* **Obtain an OMDb API Key:**
    * Visit the [OMDb API website](http://www.omdbapi.com/apikey.aspx) and sign up for a free key.
    * Open the `server.js` file and replace `"API KEY"` with your unique key.
* **Install Dependencies:**
    * Open your terminal, navigate to the project's root directory, and run:
        ```bash
        npm install express axios cors
        ```
* **Run the Server:**
    * Start the server with this command:
        ```bash
        node server.js
        ```
    * You should see a message confirming the backend is running on `http://localhost:3001`. Keep this terminal window open.

### Step 2: Install the Chrome Extension 📦

* **Go to Extensions:**
    * In your Chrome browser, type `chrome://extensions` into the address bar and hit Enter.
* **Enable Developer Mode:**
    * Toggle on the **"Developer mode"** switch located in the top-right corner.
* **Load the Extension:**
    * Click the **"Load unpacked"** button that appears.
    * A file dialog will open. Select the root folder of this project.
* That's it! The "Netflix Ratings Extension" icon will now appear in your browser's toolbar.

### Step 3: Enjoy the Ratings! 🎉

1.  Make sure your backend server is running (`node server.js`).
2.  Head over to `https://www.netflix.com`.
3.  As you browse or click on movie tiles, the extension will automatically fetch and display the ratings.

## 📁 Project Breakdown

* `manifest.json`: The heart of the extension, defining its core properties, permissions, and script locations.
* `content.js`: The "in-page" script that interacts directly with Netflix's HTML and CSS to inject the rating badges.
* `background.js`: The background service worker that manages communication, sending requests from the content script to the backend.
* `server.js`: The backend API that handles the heavy lifting of calling the OMDb API and fetching the rating data.

## 💻 Tech Stack

* **Chrome Extension:** `chrome.runtime`, `chrome.scripting`, JavaScript, HTML, CSS
* **Backend:**
    * [Node.js](https://nodejs.org/): Our server's runtime environment.
    * [Express.js](https://expressjs.com/): A lightweight and flexible web framework for the API.
    * [Axios](https://axios-http.com/): A robust HTTP client for making external API calls.
* **External API:**
    * [OMDb API](http://www.omdbapi.com/): The source of all our movie rating data.

---

## 🛑 Troubleshooting

* **Ratings are blank or not appearing:**
    * Double-check that your `server.js` file is running in a separate terminal window.
    * Verify that your OMDb API key is correctly inserted in `server.js`.
    * Check the developer console (F12) on both the Netflix page and the extension's background page for any errors.
* **"Extension context invalidated" error:**
    * This is a common Chrome issue after an extension is reloaded. A quick refresh of the Netflix page (F5) will usually fix it.
