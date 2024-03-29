chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (details.method == "GET") {
            const url = new URL(details.url);
            // Assuming using Google Search as an example
            if (url.hostname.includes("google.com") && url.pathname.includes("/search")) {
                let query = url.searchParams.get("q");
                checkForExplicitContent(query, details.tabId);
            }
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

let debounceTimer;
const debounceDelay = 500; // 0.5 second

function checkForExplicitContent(query, tabId) {
    // clearTimeout(debounceTimer);
    // debounceTimer = setTimeout(() => {
        // API credentials
        // For Sightengine API
        // const api_user = '60919021';
        // const api_secret = 'KgmaDmc35erzApQRZZZemQLoqDpcBLd6';
        // const apiEndpoint = 'https://api.sightengine.com/1.0/text/check.json';

        //For OpenAI API
        const apiEndpoint = 'https://api.openai.com/v1/moderations';

        // For Sightengine API
        // const params = new URLSearchParams();
        // params.append('text', decodeURIComponent(query));
        // params.append('mode', 'standard');
        // params.append('api_user', api_user);
        // params.append('api_secret', api_secret);
        // params.append('lang', 'en');

        // Send request
        fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                // For Sightengine API
                // 'Content-Type': 'application/x-www-form-urlencoded'

                //For OpenAI API
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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'
            },
            // For Sightengine API
            // body: params
            //For OpenAI API
            body: JSON.stringify({ input: query })
        })
            .then(response => response.json())
            .then(result => {
                //For Sightengine API
                // if (result.profanity.matches.length > 0 && result.profanity.matches != undefined) {
                //     storeSearchData(query);
                //     chrome.tabs.update(tabId, { url: "Pages/blockedpage.html" });
                // }

                //For OpenAI API
                if (result.results[0].flagged) {
                    storeSearchData(query);
                    chrome.tabs.update(tabId, { url: "Pages/blockedpage.html" });
                }

            })
            .catch(error => console.error('Error:', error));
    // }, debounceDelay);
}

//Login JS
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        chrome.tabs.create({ url: "Pages/login.html" });
    }
});

// Your web app's Firebase configuration
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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to the auth service
var auth = firebase.auth();
var database = firebase.database();
var user = "";

document.addEventListener('DOMContentLoaded', function () {
    var googleLoginButton = document.getElementById('google-login');
    var emailLoginForm = document.getElementById('email-login'); // Get the email login form
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
            if (googleLoginButton) {
                googleLoginButton.addEventListener('click', function () {
                    var provider = new firebase.auth.GoogleAuthProvider();
                    firebase.auth().signInWithPopup(provider).then(function (result) {
                        // Handle Google Login
                        user = result.user;
                        console.log("Signed in as: ", user.email);
                        // Store the user details in Realtime Database
                        //storeUserDetailsInRealtimeDatabase(user);
                    }).catch(function (error) {
                        console.error("Error during sign in: ", error.message);
                    });
                });
            }

            if (emailLoginForm) {
                emailLoginForm.addEventListener('submit', function (e) {
                    e.preventDefault();
                    var email = document.getElementById('email').value;
                    var password = document.getElementById('password').value;

                    firebase.auth().createUserWithEmailAndPassword(email, password)
                        .then((userCredential) => {
                            // Signed in 
                            user = userCredential.user;
                            console.log("Email user signed in: ", user.email);
                            // Store user details in Realtime Database
                            //storeUserDetailsInRealtimeDatabase(user);
                            localStorage.setItem('userEmail', user.email);
                            chrome.tabs.create({ url: "Pages/dashboard.html" });
                        })
                        .catch((error) => {
                            console.error("Error during email sign in: ", error.message);
                        });
                });
            }
        })
        .catch((error) => {
            console.error("Persistence setup error: ", error);
        });
});

let recentQueries = new Set();
const queryExpiryTime = 60000; // 1 minute

function storeSearchData(searchQuery) {
    const user = firebase.auth().currentUser;
    if (user) {
        // Check if the query is already in the recent queries set
        if (!recentQueries.has(searchQuery)) {
            // Add the query to the recent queries set
            recentQueries.add(searchQuery);

            // Remove the query from the set after a certain time
            setTimeout(() => {
                recentQueries.delete(searchQuery);
            }, queryExpiryTime);

            // Store the search entry
            var currentdate = new Date();
            var datetime = currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();

            const searchEntry = {
                email: user.email,
                keyword: searchQuery,
                timestamp: datetime
            };

            // Reference to your database path for search data
            const dbRef = firebase.database().ref('searches');

            // Push the new search entry
            dbRef.push(searchEntry, (error) => {
                if (error) {
                    console.error("Data could not be saved." + error);
                } else {
                    console.log("Data saved successfully.");
                }
            });

            sendEmail(user.email, searchQuery);
        }
    } else {
        console.log("User not signed in");
    }
}

emailjs.init("3fFul4aoW7U0gorm9");

function sendEmail(userEmail, keyword) {
    // Parameters to be passed into the email template
    var currentdate = new Date();
    var datetime = "on: " + currentdate.getDate() + "/"
        + (currentdate.getMonth() + 1) + "/"
        + currentdate.getFullYear() + " (dd/mm/yyyy) @ "
        + currentdate.getHours() + ":"
        + currentdate.getMinutes() + ":"
        + currentdate.getSeconds() + ".";
    var templateParams = {
        to_name: userEmail,
        from_name: 'Explict Content Management Team',
        message: 'An inappropriate keyword search has been detected ' + datetime + 'Please visit Explicit content blocking and keylogging dashboard.',
        user_email: userEmail
    };

    emailjs.send('service_6gob1pa', 'template_sx5dmcq', templateParams)
        .then(function (response) {
            console.log('Successfully sent email', response.status, response.text);
        }, function (error) {
            console.error('Failed to send email', error);
        });
}
