// document.getElementById('openDashboard').addEventListener('click', function() {
//     chrome.tabs.create({ url: "Pages/dashboard.html" });
// });

// Initialize Firebase
var firebaseConfig = {
    apiKey: "AIzaSyCQ07adUcy3bBrWk7nB3Yd2jOKIyM6lHk0",
    authDomain: "webextension-f0f9c.firebaseapp.com",
    databaseURL: "https://webextension-f0f9c-default-rtdb.firebaseio.com",
    projectId: "webextension-f0f9c",
    storageBucket: "webextension-f0f9c.appspot.com",
    messagingSenderId: "67980485197",
    appId: "1:67980485197:web:6d9cbc3d4eaa97e8287204",
    measurementId: "G-HJFZ3EN0JG"
};
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Function to validate email and password
function validateCredentials() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    // Sign in with email and password
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Sign-in successful, enable the "Open Dashboard" button
            document.getElementById('openDashboard').disabled = false;
        })
        .catch((error) => {
            // Sign-in failed, disable the "Open Dashboard" button
            document.getElementById('openDashboard').disabled = true;
            var errorCode = error.code;
            var errorMessage = error.message;
            // You can handle the error here, such as displaying a message to the user
            console.error("Error signing in: ", errorCode, errorMessage);
        });
}


// // Event listener for the input fields to enable or disable the button based on validation
// document.getElementById('email').addEventListener('input', function () {
//     document.getElementById('openDashboard').disabled = !validateCredentials();
// });

// document.getElementById('password').addEventListener('input', function () {
//     document.getElementById('openDashboard').disabled = !validateCredentials();
// });

document.addEventListener('DOMContentLoaded', function() {
    // Event listener for the "Submit" button
    document.getElementById('submitCredentials').addEventListener('click', function() {
        validateCredentials();
    });

    // Event listener for the "Open Dashboard" button
    document.getElementById('openDashboard').addEventListener('click', function() {
        chrome.tabs.create({ url: "Pages/dashboard.html" });
    });
});
