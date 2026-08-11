// Google Sign-In Options
window.onload = function () {
  // Initialize Google Identity Services
  google.accounts.id.initialize({
    client_id: "596457040910-2cb87d1p1uj6ldenbh9lttlk1ag8ghbb.apps.googleusercontent.com",
    callback: handleCredentialResponse,
    auto_select: false
  });

  // Render the standard button (Case: Users close / ignore One Tap function)
  google.accounts.id.renderButton(
    document.getElementById("buttonDiv"),
    { theme: "outline", size: "large" }
  );

  // Trigger One Tap prompt
  google.accounts.id.prompt();
};


function handleCredentialResponse(response) {
  console.log("Encoded JWT ID token: " + response.credential);

  // Decode JWT payload to get user details
  const responsePayload = parseJwt(response.credential);

  // Store email for revoke logout to call later
  localStorage.setItem("user_email", responsePayload.email);

  // Mark user as logged in
  localStorage.setItem("is_logged_in", "true");

  //Redirect to index.html
  window.location.href = "..templates/index.html";
}

// Decode Google JWT token
function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );

  return JSON.parse(jsonPayload);
}
