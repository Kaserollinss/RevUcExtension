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

        // Retrieve and display cleaned text in the geminiResponse div
        const cleanedText = message.cleanedText || "No cleaned text available.";
        const geminiResponseDiv = document.getElementById("geminiResponse");

        if (geminiResponseDiv) {
            geminiResponseDiv.innerText = cleanedText;
            console.log("📜 Cleaned text displayed in geminiResponse div.");
        } else {
            console.error("❌ Couldn't find geminiResponse div.");
        }

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

    const issueNames = {
        unclosedTags: "Unclosed HTML Tags",
        emptyLinks: "Empty Links (No Href)",
        missingHeaders: "Missing Header Tags",
        lowContrastText: "Low Contrast Text",
        smallText: "Text Too Small",
        missingLabels: "Inputs Missing Labels",
        missingLangAttributes: "Missing Language Attribute",
        buttonElementAccesible: "Buttons: Missing Labels",
        buttonElementWhiteSpaceText: "Buttons: Only Whitespace",
        buttonElementNullText: "Buttons: No Text",
        buttonElementNoLabel: "Buttons: Only Icons",
        buttonElementHiddenText: "Buttons: Hidden Text",
        buttonElementEmptyAlt: "Buttons: Missing Alt Text",
        redundantLinks: "Redundant Links",
    };

    // Iterate over the issues and display them
    for (const [issue, elements] of Object.entries(data)) {
        if (elements && elements.length > 0) {
            // Details Page
                
            
            // Summary Page
                // Create issue element
let issueElement = document.createElement('div');
issueElement.id = issue;
issueElement.className = 'issue-item mt-3';

// Create flex container for title + dropdown icon
let issueHeader = document.createElement('div');
issueHeader.style.display = "flex";
issueHeader.style.justifyContent = "space-between"; // Ensures text is left, icon is right
issueHeader.style.alignItems = "center"; // Align vertically

const issueTitle = issueNames[issue] || issue.replace(/([A-Z])/g, ' $1'); // Default fallback
let issueText = document.createElement('strong');
issueText.innerText = `${issueTitle}: ${elements.length} issues found`;

// Create dropdown link
const link = document.createElement('a');
link.setAttribute('data-bs-toggle', 'collapse');
link.setAttribute('href', `#${issue}-target`);
link.setAttribute('role', 'button');
link.setAttribute('aria-expanded', 'false');
link.setAttribute('aria-controls', `${issue}-target`);

// Create dropdown icon
const dropdownIcon = document.createElement('img');
dropdownIcon.src = "Assets/Icons/dropdown.svg";  // Ensure path is correct
dropdownIcon.alt = "Dropdown";
dropdownIcon.style.width = "16px";
dropdownIcon.style.height = "16px";
dropdownIcon.style.cursor = "pointer"; // Ensure it's clickable
dropdownIcon.style.marginLeft = "auto"; // Pushes it to the right in flexbox

// Append icon to link and add link to flex container
link.appendChild(dropdownIcon);
issueHeader.appendChild(issueText);
issueHeader.appendChild(link);

// Append header to issue element
issueElement.appendChild(issueHeader);


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

