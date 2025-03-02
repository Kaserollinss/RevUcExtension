// @ts-check
/// <reference path="./types/chrome/index.d.ts" />
/// <reference path="./types/index.d.ts" />

/**
 * @typedef {{
 *      enabled?: boolean,
 *      side?: Side,
 *      url?: string,
 *      overflowScroll?: boolean
 * }} State
 * 
 * @typedef {'top' | 'right' | 'bottom' | 'left'} Side
 */

(async () => {

    const applyState = async () => {
        // Retrieve state from local storage
        /** @type {State} */
        let state = await chrome.storage.local.get([
        'enabled',
        'side',
        'url',
        'overflowScroll'
    ]);
        console.log('WebAble Current state:', state);

        // Apply state
        if (state.enabled) {
            await chrome.declarativeNetRequest.updateStaticRules({
                enableRuleIds: [1],
                rulesetId: 'ruleset_1',
            });
        } else {
            await chrome.declarativeNetRequest.updateStaticRules({
                disableRuleIds: [1],
                rulesetId: 'ruleset_1',
            });
        }
    }

    console.log('Iframe Buddy: Running', (new Error()).stack?.split("\n")?.[1]?.trim());

    {
        // Retrieve potentially type-unsafe state from local storage
        /** @type {State} */
        let state = await chrome.storage.local.get([
            'enabled',
            'side',
            'url',
            'overflowScroll'
        ]);
        console.log('Iframe Buddy: Initial state:', state);

        // Set default values
        if (state.enabled == undefined) {
            state.enabled = true;
        }
        if (state.side == undefined) {
            state.side = 'right';
        }
        if (state.url == undefined) {
            state.url = 'https://duckduckgo.com';
        }
        if (state.overflowScroll == undefined) {
            state.overflowScroll = true;
        }

        // Save type-safe state to local storage
        await chrome.storage.local.set(state);
    }

    await applyState();

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message?.type === "accessibilityIssues") {
            console.log("🔹 Received accessibility issues from content script:", message.data);
            
            // Forward the data to the sidebar (a different part of the extension)
            chrome.runtime.sendMessage(
                { type: "accessibilityIssues", data: message.data },
                (response) => {
                    if (chrome.runtime.lastError) {
                        console.error("❌ Error relaying message to sidebar:", chrome.runtime.lastError);
                    } else if (response) {
                        console.log("✅ Message relayed to sidebar successfully!");
                    } else {
                        console.warn("⚠️ No response received from sidebar.");
                    }
                }
            );
    
            // Send a response back to content script
            sendResponse({ success: true });
        } else {
            sendResponse({ success: false, error: "Unknown request" });
        }
        return true; // Required for asynchronous sendResponse
    });

    const injectIframe = async (
        /** @type {string} */ iframeId,
        /** @type {'top' | 'right' | 'bottom' | 'left'} */ side,
        /** @type {string} */ url,
        /** @type {boolean} */ overflowScroll
    ) => {
        console.log(`Iframe Buddy: injectIframe() called`);

        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

        if (activeTab == undefined || activeTab.id == undefined) {
            alert('Iframe Buddy: No active tab found');
            return;
        }

        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (
                /** @type {string} */ iframeId,
                /** @type {'top' | 'right' | 'bottom' | 'left'} */ side,
                /** @type {string} */ url,
                /** @type {boolean} */ overflowScroll
            ) => {
                // Remove previous iframe if it exists
                document.querySelector(`#${iframeId}`)?.remove();

                // Create new iframe
                const iframe = document.createElement('iframe');
                iframe.setAttribute('id', iframeId);
                iframe.setAttribute('src', url);
                iframe.setAttribute('sandbox', 'allow-downloads allow-forms allow-modals allow-orientation-lock allow-pointer-lock allow-popups allow-popups-to-escape-sandbox allow-presentation allow-same-origin allow-scripts allow-top-navigation allow-top-navigation-by-user-activation allow-top-navigation-to-custom-protocols');
                const iframeStyle = `
                    z-index: 2147483647;
                    position: fixed;
                    border: 2px dotted black;
                `;
                if (side === 'top') {
                    iframe.setAttribute('style', `${iframeStyle}
                        top: 0%;
                        left: 0%;
                        width: 100%;
                        height: 50%;
                    `);
                }
                else if (side === 'right') {
                    iframe.setAttribute('style', `${iframeStyle}
                        top: 0%;
                        left: 50%;
                        width: 50%;
                        height: 100%;
                    `);
                } else if (side === 'bottom') {
                    iframe.setAttribute('style', `${iframeStyle}
                        top: 50%;
                        left: 0%;
                        width: 100%;
                        height: 50%;
                    `);
                } else if (side === 'left') {
                    iframe.setAttribute('style', `${iframeStyle}
                        top: 0%;
                        left: 0%;
                        width: 50%;
                        height: 100%;
                    `);
                }

                // Add iframe to body
                document.body.appendChild(iframe);

                // Position body so that it only occupies the remaining visible area
                document.body.style.setProperty('position', 'relative');
                if (side === 'top') {
                    document.body.style.setProperty('top', '50vh');
                    document.body.style.removeProperty('left');
                    document.body.style.removeProperty('width');
                    document.body.style.removeProperty('height');
                } else if (side === 'right') {
                    document.body.style.removeProperty('top');
                    document.body.style.removeProperty('left');
                    document.body.style.setProperty('width', '50%');
                    document.body.style.removeProperty('height');
                } else if (side === 'bottom') {
                    document.body.style.removeProperty('top');
                    document.body.style.removeProperty('left');
                    document.body.style.removeProperty('width');
                    document.body.style.setProperty('height', '50vh');
                } else if (side === 'left') {
                    document.body.style.removeProperty('top');
                    document.body.style.setProperty('left', '50%');
                    document.body.style.setProperty('width', '50%');
                    document.body.style.removeProperty('height');
                }

                // Add overflow: scroll to html and body for better page compatibility
                if (overflowScroll) {
                    document.documentElement.style.setProperty('overflow', 'scroll');
                    document.body.style.setProperty('overflow', 'scroll');
                }
            },
            args: [
                iframeId,
                side,
                url,
                overflowScroll
            ],
            world: 'MAIN'
        });
    }

    const removeIframe = async (
        /** @type {string} */ iframeId
    ) => {
        console.log(`Iframe Buddy: removeIframe() called`);

        const [activeTab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });

        if (activeTab == undefined || activeTab.id == undefined) {
            alert('Iframe Buddy: No active tab found');
            return;
        }

        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            func: (
                /** @type {string} */ iframeId
            ) => {
                // Remove previous iframe if it exists
                document.querySelector(`#${iframeId}`)?.remove();

                // Reset body position
                document.body.style.removeProperty('position');
                document.body.style.removeProperty('top');
                document.body.style.removeProperty('left');
                document.body.style.removeProperty('width');
                document.body.style.removeProperty('height');

                // Reset overflow: scroll on html and body
                document.documentElement.style.removeProperty('overflow');
                document.body.style.removeProperty('overflow');
            },
            args: [
                iframeId
            ],
            world: 'MAIN'
        });
    }

})();
