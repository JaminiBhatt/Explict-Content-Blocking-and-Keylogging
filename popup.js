document.getElementById('openDashboard').addEventListener('click', function() {
    chrome.tabs.create({ url: "Pages/dashboard.html" });
});
