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


document.addEventListener('DOMContentLoaded', function() {
    var googleLoginButton = document.getElementById('google-login');
    var emailLoginForm = document.getElementById('email-login'); // Get the email login form

    if (googleLoginButton) {
        googleLoginButton.addEventListener('click', function() {
            var provider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provider).then(function(result) {
                // Handle Google Login
                var user = result.user;
                console.log("Signed in as: ", user.email);
                // Store the user details in Realtime Database
                storeUserDetailsInRealtimeDatabase(user);
            }).catch(function(error) {
                console.error("Error during sign in: ", error.message);
            });
        });
    }

    if (emailLoginForm) {
        emailLoginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var email = document.getElementById('email').value;
            var password = document.getElementById('password').value;

            firebase.auth().createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Signed in 
                    var user = userCredential.user;
                    console.log("Email user signed in: ", user.email);
                    // Store user details in Realtime Database
                    storeUserDetailsInRealtimeDatabase(user);
                })
                .catch((error) => {
                    console.error("Error during email sign in: ", error.message);
                });
        });
    }
});

function storeUserDetailsInRealtimeDatabase(user) {
    firebase.database().ref('users/' + user.uid).set({
        email: user.email
        // Add any more details you want to store
    }).then(() => {
        console.log("User details stored in Realtime Database");
    }).catch((error) => {
        console.error("Error storing user details: ", error);
    });
}


