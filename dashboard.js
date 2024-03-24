
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
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

// Function to retrieve and display log information
function displayLogInfo() {
    const user = localStorage.getItem('userEmail');
    if (user) {
        const dbRef = firebase.database().ref('searches');
        dbRef.orderByChild('email').equalTo(user).on('value', function (snapshot) {
            var logTable = document.getElementById('logTable').getElementsByTagName('tbody')[0];
            logTable.innerHTML = ''; // Clear existing entries
            snapshot.forEach(function (childSnapshot) {
                var entry = childSnapshot.val();
                var row = logTable.insertRow(-1);
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2);
                cell1.innerHTML = entry.email;
                cell2.innerHTML = entry.keyword;
                cell3.innerHTML = entry.timestamp;
            });
        });
    } else {
        console.log("User not signed in");
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', function () {
    displayLogInfo();
});
