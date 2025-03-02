document.addEventListener("DOMContentLoaded", function () {
    // Get the buttons
    const summaryTab = document.getElementById("summaryTab");
    const detailsButton = document.getElementById("detailsTab");
    const aiFixesButton = document.getElementById("aiFixesTab");

    // Attach the event listeners
    summaryTab.addEventListener("click", function (event) {
        switchTab(event, 'summaryPage');
    });

    detailsButton.addEventListener("click", function (event) {
        switchTab(event, 'detailsPage');
    });

    aiFixesButton.addEventListener("click", function (event) {
        switchTab(event, 'aiFixesPage');
    });
});

function switchTab(event, pageId) {
    // Hide all content sections
    document.querySelectorAll('.content').forEach(content => {
        content.classList.add('hidden');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tabs button').forEach(button => {
        button.classList.remove('active');
    });

    // Show the selected page
    document.getElementById(pageId).classList.remove('hidden');

    // Set the clicked tab as active
    event.target.classList.add('active');
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "accessibilityIssues") {
        console.log("✅ Received accessibility issues in sidebar:", message.data);
        displayAccessibilitySummary(message.data);
    }

    // If you don't need to send a response, remove 'return true'
    return false; // OR make sure 'sendResponse' is actually called
});


// Function to update the sidebar with the summary
function displayAccessibilitySummary(data) {
    const sidebarContainer = document.getElementById("error-summary");

    // Clear previous content
    sidebarContainer.innerHTML = "";

    // Iterate over the issues and display them
    for (const [issue, elements] of Object.entries(data)) {
        if (elements && elements.length > 0) {
            let issueElement = document.createElement("div");
            issueElement.className = "issue-item";
            issueElement.innerHTML = `<strong>${issue.replace(/([A-Z])/g, ' $1')}:</strong> ${elements.length} issues found`;
            sidebarContainer.appendChild(issueElement);
        }
    }
}
