chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        if (details.method == "GET") {
            const url = new URL(details.url);
            if ((url.hostname.endsWith("google.com") || url.hostname.match(/google\.\w{2,}/)) && url.searchParams.has("oq")) {
                let query = url.searchParams.get("q");
                checkForExplicitContent(query, details.tabId);
            }
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);

// function checkForExplicitContent(query, tabId) {
//     // For Sightengine API
//     // const api_user = API_CONFIG.SIGHTENGINE_API_USER;
//     // const api_secret = 'API_CONFIG.SIGHTENGINE_API_SECRET';
//     // const apiEndpoint = 'https://api.sightengine.com/1.0/text/check.json';

//     //For OpenAI API
//     const apiEndpoint = 'https://api.openai.com/v1/moderations';
//     const tokenKey = API_CONFIG.OPENAI_SECRET;

//     // For Sightengine API
//     // const params = new URLSearchParams();
//     // params.append('text', decodeURIComponent(query));
//     // params.append('mode', 'standard');
//     // params.append('api_user', api_user);
//     // params.append('api_secret', api_secret);
//     // params.append('lang', 'en');

//     // Send request
//     fetch(apiEndpoint, {
//         method: 'POST',
//         headers: {
//             // For Sightengine API
//             // 'Content-Type': 'application/x-www-form-urlencoded'

//             //For OpenAI API
//             'Content-Type': 'application/json',
//             'Authorization': 'Bearer ' + tokenKey
//         },
//         // For Sightengine API
//         // body: params
//         //For OpenAI API
//         body: JSON.stringify({ input: query })
//     })
//         .then(response => response.json())
//         .then(result => {
//             //For Sightengine API
//             // if (result.profanity.matches.length > 0 && result.profanity.matches != undefined) {
//             //     storeSearchData(query);
//             //     chrome.tabs.update(tabId, { url: "Pages/blockedpage.html" });
//             // }

//             //For OpenAI API
//             if (result != undefined && result != {} && result.results[0].flagged) {
//                 storeSearchData(query);
//                 chrome.tabs.update(tabId, { url: "Pages/blockedpage.html" });
//             }
//         })
//         .catch(error => console.error('Error:', error));
// }

function checkForExplicitContent(query, tabId) {
    //For OpenAI API
    const openAiEndpoint = 'https://api.openai.com/v1/moderations';
    const openAiTokenKey = API_CONFIG.OPENAI_SECRET;

    // For Sightengine API
    const sightengineApiUser = API_CONFIG.SIGHTENGINE_API_USER;
    const sightengineApiSecret = API_CONFIG.SIGHTENGINE_API_SECRET;
    const sightengineEndpoint = 'https://api.sightengine.com/1.0/text/check.json';
    const params = new URLSearchParams();
    params.append('text', decodeURIComponent(query));
    params.append('mode', 'standard');
    params.append('api_user', sightengineApiUser);
    params.append('api_secret', sightengineApiSecret);
    params.append('lang', 'en');

    // Check with OpenAI API first
    fetch(openAiEndpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + openAiTokenKey
        },
        body: JSON.stringify({ input: query })
    })
        .then(response => response.json())
        .then(result => {
            if (result.results[0].flagged) {
                // Flagged by OpenAI
                console.log('Blocked by OpenAI');
                chrome.tabs.update(tabId, { url: "Pages/blockedpage.html" });
                storeSearchData(query);
            } else {
                // Not flagged by OpenAI, check with Sightengine
                fetch(sightengineEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: params
                })
                    .then(response => response.json())
                    .then(result => {
                        if (result.profanity.matches.length > 0 && result.profanity.matches !== undefined) {
                            // Flagged by Sightengine
                            console.log('Blocked by SightEngine');
                            chrome.tabs.update(tabId, { url: "Pages/blockedpage.html" });
                            storeSearchData(query);
                        }
                    })
                    .catch(error => console.error('Error:', error));
            }
        })
        .catch(error => console.error('Error:', error));
}




//Open Sign up page
chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === "install") {
        chrome.tabs.create({ url: "Pages/login.html" });
    }
});

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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Reference to the auth service
var auth = firebase.auth();
var database = firebase.database();
var user = "";

document.addEventListener('DOMContentLoaded', function () {
    var emailLoginForm = document.getElementById('email-login'); // Get the email login form
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(() => {
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
                            alert('Sign up successful!');
                            localStorage.setItem('userEmail', user.email);
                            chrome.tabs.create({ url: "Pages/dashboard.html" });

                        })
                        .catch((error) => {
                            console.error("Error during email sign in: ", error.message);
                            alert(error.message);
                        });
                });
            }
        })
        .catch((error) => {
            console.error("Persistence setup error: ", error);
        });
});

// let recentQueries = new Set();
// const queryExpiryTime = 60000; // 1 minute

// function storeSearchData(searchQuery) {
//     const user = firebase.auth().currentUser;
//     if (user) {
//         // Check if the query is already in the recent queries set
//         if (!recentQueries.has(searchQuery)) {
//             // Add the query to the recent queries set
//             recentQueries.add(searchQuery);

//             // Remove the query from the set after a certain time
//             setTimeout(() => {
//                 recentQueries.delete(searchQuery);
//             }, queryExpiryTime);

//             // Store the search entry
//             var currentdate = new Date();
//             var datetime = currentdate.getDate() + "/"
//                 + (currentdate.getMonth() + 1) + "/"
//                 + currentdate.getFullYear() + " @ "
//                 + currentdate.getHours() + ":"
//                 + currentdate.getMinutes() + ":"
//                 + currentdate.getSeconds();

//             const searchEntry = {
//                 email: user.email,
//                 keyword: searchQuery,
//                 timestamp: datetime
//             };

//             // Reference to database path for search data
//             const dbRef = firebase.database().ref('searches');

//             // Push the new search entry
//             dbRef.push(searchEntry, (error) => {
//                 if (error) {
//                     console.error("Data could not be saved." + error);
//                 } else {
//                     console.log("Data saved successfully.");
//                 }
//             });

//             sendEmail(user.email, searchQuery);
//         }
//     } else {
//         console.log("User not signed in");
//     }
// }



function storeSearchData(searchQuery) {
    const user = firebase.auth().currentUser;
    if (user) {
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

        // Reference to database path for search data
        const dbRef = firebase.database().ref('searches');

        // Check if the entry already exists for the same user, search query, and timestamp
        dbRef.orderByChild('email')
            .equalTo(user.email)
            .once('value', function (snapshot) {
                let entryExists = false;
                snapshot.forEach(function (childSnapshot) {
                    const entry = childSnapshot.val();
                    if (entry.email === user.email && entry.keyword === searchQuery && entry.timestamp === datetime) {
                        entryExists = true;
                    }
                });

                if (!entryExists) {
                    // Entry does not exist, push the new search entry
                    dbRef.push(searchEntry, (error) => {
                        if (error) {
                            console.error("Data could not be saved." + error);
                        } else {
                            console.log("Data saved successfully.");
                            sendEmail(user.email, searchQuery);
                        }
                    });
                } else {
                    console.log("Entry already exists for the same user, search query, and timestamp.");
                }
            });

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
        message: 'An inappropriate keyword search has been detected ' + datetime + '\nPlease visit Explicit content blocking and keylogging dashboard.',
        user_email: userEmail
    };

    emailjs.send('service_6gob1pa', 'template_sx5dmcq', templateParams)
        .then(function (response) {
            console.log('Successfully sent email', response.status, response.text);
        }, function (error) {
            console.error('Failed to send email', error);
        });
}
