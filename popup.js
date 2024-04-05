//Firebase configuration
var firebaseConfig = {
    apiKey: API_CONFIG.apiKey,
    authDomain: API_CONFIG.authDomain,
    databaseURL: API_CONFIG.databaseURL,
    projectId: API_CONFIG.projectId,
    storageBucket: API_CONFIG.storageBucket,
    messagingSenderId: API_CONFIG.messagingSenderId,
    appId: API_CONFIG.appId,
    measurementId: API_CONFIG.measurementId
};
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
auth = firebase.auth();

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
            console.error("Error signing in: ", errorCode, errorMessage);
        });
}


document.addEventListener('DOMContentLoaded', function () {
    var submitButton = document.getElementById('submitCredentials');
    if (submitButton) {
        submitButton.addEventListener('click', function () {
            validateCredentials();
        });
    }

    var openDashboardButton = document.getElementById('openDashboard');
    if (openDashboardButton) {
        openDashboardButton.addEventListener('click', function () {
            chrome.tabs.create({ url: "Pages/dashboard.html" });
        });
    }
});

