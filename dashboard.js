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
var database = firebase.database();

// Function to retrieve and display log information
function displayLogInfo() {
    const user = localStorage.getItem('userEmail');
    if (user) {
        const dbRef = firebase.database().ref('searches');
        dbRef.orderByChild('email').equalTo(user).on('value', function (snapshot) {
            var logTable = document.getElementById('logTable').getElementsByTagName('tbody')[0];
            logTable.innerHTML = ''; // Clear existing entries

            // Check if there are entries
            if (snapshot.exists()) {
                var entries = [];
                snapshot.forEach(function (childSnapshot) {
                    entries.push(childSnapshot.val());
                });

                // Sort entries by timestamp in descending order
                entries.sort(function (a, b) {
                    return b.timestamp - a.timestamp;
                });

                // Add sorted entries to the table
                entries.forEach(function (entry) {
                    var row = logTable.insertRow(-1);
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    cell1.innerHTML = entry.email;
                    cell2.innerHTML = entry.keyword;
                    cell3.innerHTML = entry.timestamp;
                });
            } else {
                // Add a row saying 'No history yet'
                var row = logTable.insertRow(-1);
                var cell = row.insertCell(0);
                cell.colSpan = 3;
                cell.innerHTML = 'No history yet';
                cell.style.textAlign = 'center';
            }
        });
    } else {
        console.log("User not signed in");
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', function () {
    displayLogInfo();
    var timestampSortIcon = document.getElementById('timestampSortIcon');
    if (timestampSortIcon) {
        timestampSortIcon.addEventListener('click', sortTableByTimestamp);
    }
});

var sortAscending = true; // Global variable to toggle sorting order

function sortTableByTimestamp() {
    var table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById("logTable");
    switching = true;
    // Loop until no switching is needed
    while (switching) {
        switching = false;
        rows = table.rows;
        // Loop through all table rows (except the first, which contains table headers)
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[2]; // Timestamp column
            y = rows[i + 1].getElementsByTagName("TD")[2]; // Timestamp column
            // Check if the rows should switch place, based on the sorting order
            if (sortAscending) {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            // If a switch has been marked, make the switch and mark that switching has been done
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
    sortAscending = !sortAscending; // Toggle the sorting order for the next click
}



