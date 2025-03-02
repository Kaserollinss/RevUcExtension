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
