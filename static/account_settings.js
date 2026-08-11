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
  window.location.href = "./index.html";
});
