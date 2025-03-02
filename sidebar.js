document.addEventListener("DOMContentLoaded", function () {

    const script = document.createElement('script');

    // Set the src attribute to the Bootstrap bundle
    script.src = "Assets/bootstrap.bundle.js";
// Append the script tag to the document head
    document.head.appendChild(script);

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



// Function to scroll to a specific element by ID
function scrollToElement(elementId) {
const element = document.querySelector(`.${elementId}`); // Use getElementById for ID lookup
if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
} else {
    console.warn(`Element with ID "${elementId}" not found.`);
}
}

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
        sendResponse({ success: true });  // ✅ Always send a response
        return true;  // ✅ Keep the channel open if needed
    }

    sendResponse({ success: false, error: "Unknown request" });
    return false;
});

// Function to update the sidebar with the summary
function displayAccessibilitySummary(data) {
    const sidebarContainer = document.getElementById("summaryPage");

    // Clear previous content
    sidebarContainer.innerHTML = "";

    // Iterate over the issues and display them
    for (const [issue, elements] of Object.entries(data)) {
        if (elements && elements.length > 0) {
            // Details Page
                
            
            // Summary Page
                // Create collapse toggle button
                const link = document.createElement('a');
                link.classList.add('float-end');
                link.setAttribute('data-bs-toggle', 'collapse');
                link.setAttribute('href', `#${issue}-target`);
                link.setAttribute('role', 'button');
                link.setAttribute('aria-expanded', 'false');
                link.setAttribute('aria-controls', `${issue}-target`);
                const dropdownIcon = document.createElement('img');
                dropdownIcon.src = "Assets/Icons/dropdown.svg";  // Ensure this path is correct
                dropdownIcon.alt = "Dropdown";  // Accessibility improvement
                dropdownIcon.style.width = "16px";  // Adjust the size as needed
                dropdownIcon.style.height = "16px";

                link.appendChild(dropdownIcon);


                // Create issue element
                let issueElement = document.createElement('div');
                issueElement.id = issue;
                issueElement.className = 'issue-item mt-3';
                issueElement.innerHTML = `<strong>${issue.replace(/([A-Z])/g, ' $1')}:</strong> ${elements.length} issues found`;
                issueElement.appendChild(link);

                // Create collapsible container
                let container = document.createElement('div');
                container.id = `${issue}-target`;
                container.classList.add('collapse', 'mt-2');

                elements.forEach((element, index) => {
                    const row = document.createElement('div');
                    row.style.display = 'flex';
                    row.style.alignItems = 'center';
                    row.style.gap = '10px';

                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `${issue}-checkbox-${index}`;
                    checkbox.checked = true;

                    const image = document.createElement('img');
                    image.src = "/Assets/Icons/broken_button.svg"
                    image.classList.add("image-target")

// Loop through each element and add the event listener
                    image.addEventListener("click", function() {
                        scrollToElement(element);
                    });
                
                    //image.setAttribute("element-html", document.getElementsByClassName(element)[0])
    
                    

                    const label = document.createElement('label');
                    label.setAttribute('for', checkbox.id);
                    label.textContent = element;

                    row.appendChild(checkbox);
                    row.appendChild(image);

                    row.appendChild(label);
                    container.appendChild(row);
                });

                // Append elements to sidebar
                sidebarContainer.appendChild(issueElement);
                sidebarContainer.appendChild(container);
            }
    }

    // Initialize collapsibles
    // const collapsibles = document.querySelectorAll('.collapse');
    // if (collapsibles.length > 0) {
    //     collapsibles.forEach(function (collapseElement) {
    //         new bootstrap.Collapse(collapseElement);
    //     });
    // }
}
