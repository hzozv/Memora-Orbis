if (localStorage.getItem("is_logged_in") !== "true") {
  window.location.href = "../index.html";
}

// Log Out
document.getElementById("log_out-account_settings").addEventListener("click", (e) => {
  e.preventDefault(); 

  // Disable Google Auto-Select
  google.accounts.id.disableAutoSelect();

  // Revoke session access
  google.accounts.id.revoke(localStorage.getItem("user_email"));

  // Clear stored app data
  localStorage.clear();

  // Redirect the user
  window.location.href = "../index.html";
});



// Prep to sync data
let tokenClient;
let accessToken = null; // Guard Clause

let pendingAction = null; // Remembers what function was waiting for the token

function initializeDriveSync() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: "596457040910-2cb87d1p1uj6ldenbh9lttlk1ag8ghbb.apps.googleusercontent.com",
    scope: "https://www.googleapis.com/auth/drive.appdata",
    callback: (tokenResponse) => {
      if (tokenResponse.access_token) {
        accessToken = tokenResponse.access_token;
        console.log("Drive Access Granted!");

        // Run if a function was waiting for access
        if (pendingAction) {
          pendingAction();
          pendingAction = null; // Clear after running
        }
      }
    },
  });
}
window.initializeDriveSync = initializeDriveSync;

// Requests an access token for drive access
function requestDriveAccess(actionToRun) {
  pendingAction = actionToRun; // Save the function (e.g. saveToDrive)

  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    alert("An access token has not been initialized yet, please try again.")
    console.error("tokenClient is not initialized yet.");
    initializeDriveSync();
  }
}



// Syncing Data
async function saveToDrive() {
  if (!accessToken) {
    requestDriveAccess(saveToDrive); // Pass saveToDrive so it runs automatically after permission!
    return;
  }

  try {
    // JavaScript Object for user data
    const userData = {
      username: localStorage.getItem("username"),
      current_lvl: localStorage.getItem("current_lvl"),
      total_xp: localStorage.getItem("total_xp"),
      current_xp: localStorage.getItem("current_xp"),
      max_xp: localStorage.getItem("max_xp"),
      display: localStorage.getItem("display"),
      overflow_xp: localStorage.getItem("overflow_xp")
    };

    const fileContent = JSON.stringify(userData);

    // 1. Search for existing file
    const searchUrl = "https://www.googleapis.com/drive/v3/files?" + new URLSearchParams({
      spaces: 'appDataFolder',
      q: "name = 'user_data.json' and trashed = false",
      fields: 'files(id)'
    });

    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: { 'Authorization': 'Bearer ' + accessToken }
    });
    const searchResult = await searchResponse.json();

    const form = new FormData();
    let uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
    let httpMethod = 'POST';

    // 2. Build request body based on whether file exists
    if (searchResult.files && searchResult.files.length > 0) {
      // Overwrite existing file (PATCH only needs the file content)
      const fileId = searchResult.files[0].id;
      uploadUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`;
      httpMethod = 'PATCH';

      form.append('file', new Blob([fileContent], { type: 'application/json' }));
    } else {
      // Create new file with POST 
      const fileMetadata = {
        name: 'user_data.json',
        parents: ['appDataFolder'] 
      };

      form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
      form.append('file', new Blob([fileContent], { type: 'application/json' }));
    }

    // 3. Send update/create request
    const response = await fetch(uploadUrl, {
      method: httpMethod,
      headers: { 'Authorization': 'Bearer ' + accessToken },
      body: form
    });

    const result = await response.json();
    console.log('Saved to Drive:', result);

    alert("Data successfully synced to Google Drive!");

  } catch (error) {
    console.error("Error syncing to drive", error);
  }
}



// Loading Data from Drive
async function loadFromDrive() {
  if (!accessToken) {
    requestDriveAccess(loadFromDrive); // Pass loadFromDrive so it runs automatically after permission!
    return;
  }

  try {
    // Try and find appFolder inside drive
    const searchUrl = "https://www.googleapis.com/drive/v3/files?" + new URLSearchParams({
      spaces: 'appDataFolder',
      q: "name = 'user_data.json' and trashed = false",
      fields: 'files(id, name)'
    });

    // HTTP Fetch request to Google Drive
    const searchResponse = await fetch(searchUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    });

    // Convert data from .json to javascript object
    const searchResult = await searchResponse.json();

    // Checks if file empty
    if (!searchResult.files || searchResult.files.length === 0) {
      alert("No saved data found in your Google Drive!");
      return;
    }
    // Get the file ID from search results
    const fileId = searchResult.files[0].id;

    // Create download link to download contents
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

    // Download contents
    const contentResponse = await fetch(downloadUrl, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    });

    // Change contents of file from json to javascript object
    const userData = await contentResponse.json();

    // Setting values to local storage (should be changed to SQLITE3 Database)
    if (userData.username !== undefined) localStorage.setItem("username", userData.username);
    if (userData.current_lvl !== undefined) localStorage.setItem("current_lvl", userData.current_lvl);
    if (userData.total_xp !== undefined) localStorage.setItem("total_xp", userData.total_xp);
    if (userData.current_xp !== undefined) localStorage.setItem("current_xp", userData.current_xp);
    if (userData.max_xp !== undefined) localStorage.setItem("max_xp", userData.max_xp);
    if (userData.display !== undefined) localStorage.setItem("display", userData.display);
    if (userData.overflow_xp !== undefined) localStorage.setItem("overflow_xp", userData.overflow_xp);

    // Success msg
    alert("Data successfully restored from Google Drive!");
  }

  // Error Handling
  catch (error) {
    alert("Error in retrieving data from drive")
    console.error("Error retrieving data from drive", error);
  }
}


