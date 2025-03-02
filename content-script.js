const iframe = document.createElement("iframe")
iframe.width = "400px"
iframe.height = "850vh"
//iframe.src = "http://127.0.0.1:5500/sidebar.html#" //chrome.runtime
iframe.src =  chrome.runtime.getURL('sidebar.html')

//iframe.setAttribute('sandbox', 'allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols');
document.body.appendChild(iframe)