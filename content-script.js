
// Create a new div element (sidebar)
const sidebar = document.createElement('div');
sidebar.style.width = '400px'; // Sidebar width
sidebar.style.height = '100vh'; // Full viewport height
sidebar.id = "iframePushContainer"
// Select the body
const body = document.body;

// Create a wrapper div to hold both the sidebar and the content
const wrapper = document.createElement('div');
wrapper.style.display = 'flex'; // Use flexbox to align sidebar and content
wrapper.style.width = '100vw'; // Full viewport width
wrapper.appendChild(sidebar);

// Create a new container for the original page content
const contentContainer = document.createElement('div');
contentContainer.style.flexGrow = '1'; // Take up the remaining space
contentContainer.style.paddingLeft = '10px'; // Small padding for spacing

// Move all existing body content into the new content container
while (body.firstChild) {
    contentContainer.appendChild(body.firstChild);
}

// Append everything in order
wrapper.appendChild(contentContainer);
body.appendChild(wrapper);




// Call the function to inject the div and push the page content


const iframe = document.createElement("iframe")
iframe.width = "400px"
iframe.height = "950vh"
//iframe.src = "http://127.0.0.1:5500/sidebar.html#" //chrome.runtime
iframe.src =  chrome.runtime.getURL('sidebar.html')
iframe.id = "iframe-container"
iframe.style.marginLeft= "-10px"
sidebar.appendChild(iframe)
//iframe.setAttribute('sandbox', 'allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols');
//document.body.appendChild(iframe)