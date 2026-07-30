// Accessing Elements
const xp_bar = document.getElementById("xp_bar");


// Variables used
let username = localStorage.getItem("username") || ""; // Username
let current_lvl = Number(localStorage.getItem("current_lvl")) || 1; // Current Level
let total_xp = Number(localStorage.getItem("total_xp")) || 0; // Total XP
let current_xp = Number(localStorage.getItem("current_xp")) || 0; // Current XP
let max_xp = Number(localStorage.getItem("max_xp")) || 20; // Max XP
let display = "You need " + (max_xp - current_xp) + " more XP to reach Level " + (current_lvl + 1) + ("!"); // Title tag for progress bar
let overflow_xp = Number(localStorage.getItem("overflow_xp")) || xp_bar.value; // XP leftover from leveling up


// Saving Progress to Local Storage
function save() {
    localStorage.setItem("username", username); // Username
    localStorage.setItem("current_lvl", current_lvl); // Current Level
    localStorage.setItem("total_xp", total_xp); // Total XP
    localStorage.setItem("current_xp", xp_bar.value); // Current XP (edit?)
    localStorage.setItem("max_xp", xp_bar.max); // Max XP (edit?)
    localStorage.setItem("display", xp_bar.title); // Title tag for progress bar
    localStorage.setItem("overflow_xp", overflow_xp); // XP leftover from levelup

}


// Updating HTML to match Local Storage values
function load() {
    document.getElementById("welcome_msg").innerHTML = "Welcome, " + username + "!"; // Username
    document.getElementById("current_lvl").innerHTML = current_lvl; // Current Level (Label)
    document.getElementById("total_xp").innerHTML = total_xp; // Total XP (Label)
    document.getElementById("current_xp").innerHTML = current_xp; // Current XP (Label)
    document.getElementById("current_max_xp").innerHTML = max_xp; // Max XP (Label)
    xp_bar.value = current_xp; // Current XP (Progress Bar)
    xp_bar.max = max_xp; // Max XP (Progress Bar)
    xp_bar.title = display; // Title (Progress Bar)
}

load()


// Reseting progress (Testing)
function reset() {
    localStorage.clear();
}


// Prompts the user for their username when the website first loads and uses it to greet them
function greet_msg() {
    if (username == "") {
        username = prompt("How should we call you?").trim();
        while (username == "" || null) {
            alert("Your username can't be blank!");
            username = prompt("How should we call you?").trim();
        }
    let default_msg = document.getElementById("welcome_msg");
    default_msg.innerHTML = "Welcome " + username + "!";
    }
}
greet_msg()


/*
Changes the value and max of the progression bar and handles overflows.
Title of progression bar and label is updated accordingly
*/
function level_up() {
    if (overflow_xp >= xp_bar.max) {
        xp_bar.value = overflow_xp - xp_bar.max;
        overflow_xp = xp_bar.value;
        xp_bar.max = Math.round(xp_bar.max * 1.1);
        document.getElementById("current_max_xp").innerHTML = xp_bar.max;
        current_lvl += 1;
        document.getElementById("current_lvl").innerHTML = current_lvl;
        document.getElementById("current_xp").innerHTML = xp_bar.value;
        xp_bar.title = "You need " + (xp_bar.max - xp_bar.value) + " more xp to reach Level " + (current_lvl + 1) + " !";
        alert("Congrats, You've leveled up to Level " + current_lvl + "! :D");

    }
}


// This function should be changed to accept a value and use that instead of the hard-coded '15'.
function add_xp() {
    xp_bar.value += 6
    overflow_xp += 6
    document.getElementById("current_xp").innerHTML = xp_bar.value;
    xp_bar.title = "You need " + (xp_bar.max - xp_bar.value) + " more xp to reach Level " + (current_lvl + 1) + " !";
    level_up();          
    total_amount_xp();   
}

// Records the amount of xp gained
function total_amount_xp() {
    document.getElementById("total_xp").innerHTML = total_xp += 6;
}

