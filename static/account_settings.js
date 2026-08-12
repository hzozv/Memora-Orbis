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

function initializeDriveSync() {
  // Request access, receive token for current session
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: "596457040910-2cb87d1p1uj6ldenbh9lttlk1ag8ghbb.apps.googleusercontent.com",
    scope: "https://www.googleapis.com/auth/drive.appdata",
    callback: (tokenResponse) => {
      if (tokenResponse.access_token) {
        accessToken = tokenResponse.access_token;
        console.log("Drive Access Granted!");
      }
    },
  });
}
initializeDriveSync();



// Call this when the user clicks a "Sync to Drive" button
function requestDriveAccess() {
  if (tokenClient) {
    tokenClient.requestAccessToken();
  } else {
    console.error("tokenClient is not initialized yet. Re-trying initialization...");
    initializeDriveSync();
  }
}



// Syncing Data
async function saveToDrive() {
  requestDriveAccess();
  if (!accessToken) {
    return; // End
  }
  // JavaScript Object for user data (should be modified for storing SQLITE3 database)
  const userData = {
    username: localStorage.getItem("username"),
    current_lvl: localStorage.getItem("current_lvl"),
    total_xp: localStorage.getItem("total_xp"),
    current_xp: localStorage.getItem("current_xp"),
    max_xp: localStorage.getItem("max_xp"),
    display: localStorage.getItem("display"),
    overflow_xp: localStorage.getItem("overflow_xp")
  };

  // How to store and where to store file
  const fileMetadata = {
    name: 'user_data.json',
    parents: ['appDataFolder'] 
  };

  // Javascript Object to Json file
  const fileContent = JSON.stringify(userData);

  // Combine data and its meta data into one request
  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileContent], { type: 'application/json' }));

  // Sending request to Google REST API
  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + accessToken
    },
    body: form
  });

  // Reads raw JSON text sent back by Google and converts it into a usable JavaScript object
  const result = await response.json();
  console.log('Saved to Drive:', result);

}
