//TOOLTIP AND ICON INJECTION FUNCTION
function injectWarningIcon(element, iconPath, explanation, htmlCode) {
    if (!element) {
        console.error("❌ injectWarningIcon called with an undefined element!");
        return;
    }

    // Check if the element is inside the sidebar
    if (element.closest(".sidebar")) {
        console.log("Skipping icon injection for sidebar element:", element);
        return;
    }

    // Create the icon element
    let warningIcon = document.createElement("img");
    warningIcon.src = chrome.runtime.getURL(iconPath);
    warningIcon.alt = "Warning Icon";
    warningIcon.className = "accessibility-warning-icon";

    // Create tooltip container
    let tooltip = document.createElement("div");
    tooltip.className = "accessibility-tooltip";

    // Create explanation section
    let explanationSection = document.createElement("div");
    explanationSection.className = "tooltip-explanation";
    explanationSection.innerText = explanation;

    // Create HTML code section
    let htmlCodeSection = document.createElement("pre");
    htmlCodeSection.className = "tooltip-html-code";
    htmlCodeSection.innerText = htmlCode.trim();

    // Append sections to tooltip
    tooltip.appendChild(explanationSection);
    tooltip.appendChild(htmlCodeSection);

    // Wrap icon inside a span for better styling
    let iconContainer = document.createElement("span");
    iconContainer.className = "accessibility-icon-container";
    iconContainer.appendChild(warningIcon);
    iconContainer.appendChild(tooltip);

    // Insert the icon **AFTER** the problematic element
    element.parentNode.insertBefore(iconContainer, element.nextSibling);

    // Adjust tooltip position after adding to DOM
    setTimeout(() => adjustTooltipPosition(tooltip), 50);
}


/**
 * Adjust tooltip position to prevent it from overflowing off-screen.
 */
function adjustTooltipPosition(tooltip) {
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Ensure tooltip styles remain intact
    tooltip.style.border = "2px solid black"; // Restore border
    tooltip.style.backgroundColor = "#ffffff";  // Ensure background remains dark
    tooltip.style.color = "#000000";            // Ensure text remains visible
    tooltip.style.padding = "5px";           // Prevent content from touching borders
    tooltip.style.borderRadius = "5px";      // Smooth edges
    tooltip.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)"; // Prevent flat design

    // Adjust tooltip position if off-screen to the right
    if (tooltipRect.right > viewportWidth) {
        tooltip.style.left = "auto";
        tooltip.style.right = "0";
        tooltip.style.transform = "translateX(0)";
    }

    // Adjust tooltip position if off-screen to the left
    if (tooltipRect.left < 0) {
        tooltip.style.left = "0";
        tooltip.style.transform = "translateX(0)";
    }

    // Adjust tooltip position if off-screen at the top
    if (tooltipRect.top < 0) {
        tooltip.style.top = "5px"; // Prevent it from going off the top of the screen
        tooltip.style.bottom = "auto";
        tooltip.style.transform = "translateY(0)";
    }

    // Adjust tooltip position if off-screen at the bottom
    if (tooltipRect.bottom > viewportHeight) {
        tooltip.style.top = "auto";
        tooltip.style.bottom = "5px"; // Prevent it from going off the bottom of the screen
    }
}





//ERROR: detect unclosed tags
function detectUnclosedTagsFromDOM() {
    let detectUnclosedTagsList = [];
    const elements = document.body.getElementsByTagName("*");
    const unclosedTags = [];

    Array.from(elements).forEach((el) => {
        const tagName = el.tagName.toLowerCase();
        const isSelfClosing = ["meta", "img", "br", "hr", "input", "link"].includes(tagName);

        if (!isSelfClosing && el.outerHTML.indexOf(`</${tagName}>`) === -1) {
            unclosedTags.push(el);
            // Assign a unique class
            const uniqueClass = `missingClosingTag-${detectUnclosedTagsList?.length || 0}`;
            el.classList.add('missingClosingTag');
            el.classList.add(uniqueClass);
            // Add the new class to the list
            detectUnclosedTagsList.push(uniqueClass);
            // Add red border
            el.style.border = "2px solid red";

            // Inject warning icon
            let warningIcon = document.createElement("img");
            warningIcon.src = chrome.runtime.getURL("assets/icons/broken_tag.svg");
            warningIcon.alt = "Warning: Unclosed tag";
            warningIcon.className = "accessibility-warning-icon";

            el.parentNode.insertBefore(warningIcon, el.nextSibling);
        }
    });

    if (unclosedTags.length > 0) {
        console.warn("❌ Missing closing tags for:", unclosedTags);
    } else {
        console.log("✅ No missing closing tags detected.");
    }
    return detectUnclosedTagsList;
}



//ERROR: detect empty links
function detectEmptyLinks() {
    let detectEmptyLinksList = [];
    console.log("empty link EXECUTED");
    const links = document.querySelectorAll("a"); // Get all <a> elements
    const emptyLinks = [];

    links.forEach((link) => {
        if (!link.hasAttribute("href") || link.getAttribute("href").trim() === "") {
            emptyLinks.push(link);
        }
    });

    if (emptyLinks.length > 0) {
        console.log(`❌ Found ${emptyLinks.length} <a> tags without an href:`, emptyLinks);
        
        emptyLinks.forEach((link, index) => {
            link.style.border = "2px solid red"; // Highlight them on the page
            console.log(`Missing href in <a> tag #${index + 1}:`, link.outerHTML);
            
            // Assign a unique class
            const uniqueClass = `detectEmptyLinks-${detectEmptyLinksList?.length || 0}`;
            link.classList.add('detectEmptyLinks');
            link.classList.add(uniqueClass);
            // Add the new class to the list
            detectEmptyLinksList.push(uniqueClass);
            // Create and inject the warning icon
            let warningIcon = document.createElement("img");
            // warningIcon.src = chrome.runtime.getURL("assets/icons/broken_link.svg");
            // warningIcon.alt = "Warning: Broken link";
            // warningIcon.className = "accessibility-warning-icon"; // Add a CSS class for styling

            injectWarningIcon(link, "assets/icons/broken_link.svg", `Empty Link: Missing href in <a> tag`, `${link.outerHTML}`);

            
            // Insert the icon after the empty link
            link.parentNode.insertBefore(warningIcon, link.nextSibling);
        });
    } else {
        console.log("✅ All <a> tags have valid href attributes.");
    }
    return detectEmptyLinksList;
}


//WARNING: detect missing headers
function detectMissingHeaders() {
    const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    if (headers.length === 0) {
        console.warn("❌ No header tags (h1-h6) detected on this page.");

        // Highlight the body to show the issue
        document.body.style.border = "2px solid #E79F00";

        console.warn("Page highlighted with red border due to missing headers.");
    } else {
        console.log(`✅ Found ${headers.length} header tag(s) on this page.`);
    }
}

// WARNING: Check for input labels
function checkInputLabels() {
    let detectMissingLabelsList = [];
    const inputs = document.querySelectorAll("input"); // ✅ Removed duplicate declaration

    inputs.forEach(function(element, index) {
        const inputId = element.getAttribute('id');
        let hasLabel = false;

        // Check if an input has a corresponding label with a "for" attribute matching its id
        if (inputId && document.querySelectorAll(`label[for='${inputId}']`).length > 0) {
            hasLabel = true;
        }

        // Check if the input is wrapped inside a label
        if (element.closest('label')) {
            hasLabel = true;
        }

        // If no label is found, process the input element
        if (!hasLabel) {
            console.log(`❌ Input ${index} has no corresponding label.`);

            // Assign a unique class
            const uniqueClass = `missingInputLabels-${detectMissingLabelsList.length}`;
            element.classList.add('missingInputLabels', uniqueClass);

            // Add the new class to the list
            detectMissingLabelsList.push(uniqueClass);

            // Add red border
            element.style.border = "2px solid red";

            // Use `injectWarningIcon` instead of manually creating the icon
            injectWarningIcon(
                element, 
                "assets/icons/missing_label_header.svg", 
                "This input field is missing an associated label, which can make it harder for screen readers to interpret.", 
                element.outerHTML
            );
        }
    });

    return detectMissingLabelsList;
}




// WARNING: Check good text contrast
function checkTextContrast() {
    // Helper function to calculate luminance
    function luminance(rgb) {
        var r = rgb[0] / 255;
        var g = rgb[1] / 255;
        var b = rgb[2] / 255;

        r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // Helper function to calculate contrast ratio
    function calculateContrast(rgb1, rgb2) {
        var lum1 = luminance(rgb1);
        var lum2 = luminance(rgb2);
        var light = Math.max(lum1, lum2);
        var dark = Math.min(lum1, lum2);
        return (light + 0.05) / (dark + 0.05);
    }

    // Convert a color (hex or rgb) to RGB array [r, g, b]
    function hexToRgb(color) {
        if (!color) return null;

        var result;
        if (color.startsWith('rgb')) {
            result = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
            return result ? [parseInt(result[1]), parseInt(result[2]), parseInt(result[3])] : null;
        } else if (color.startsWith('#')) {
            var hex = color.substring(1);
            if (hex.length === 6) {
                return [
                    parseInt(hex.substring(0, 2), 16),
                    parseInt(hex.substring(2, 4), 16),
                    parseInt(hex.substring(4, 6), 16)
                ];
            }
        }
        return null;
    }

    // Function to get effective background color (fix for transparency issues)
    function getEffectiveBackgroundColor(element) {
        let bgColor;
        while (element) {
            bgColor = window.getComputedStyle(element).getPropertyValue('background-color');

            if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                return bgColor;
            }

            element = element.parentElement;
            if (!element) break;
        }
        return 'rgb(255, 255, 255)'; // Default to white if no background found
    }

    // Function to check for low contrast
    function checkContrast() {
        var allElements = document.querySelectorAll('*');
        
        allElements.forEach(function(element) {
            var color = window.getComputedStyle(element).getPropertyValue('color');
            var backgroundColor = getEffectiveBackgroundColor(element); // Use inherited background

            if (color && backgroundColor) {
                var textColor = hexToRgb(color);
                var bgColor = hexToRgb(backgroundColor);

                if (textColor && bgColor) {
                    var contrastRatio = calculateContrast(textColor, bgColor);

                        if (contrastRatio < 4.5) {
                            //console.warn(`❌ Low contrast detected on <${element[0].tagName.toLowerCase()}>. Ratio: ${contrastRatio.toFixed(2)}`, element[0]);

                        // Ensure red border is visible on inline elements
                        if (window.getComputedStyle(element).display === "inline") {
                            element.style.borderBottom = "2px solid #E79F00";
                            element.style.paddingBottom = "2px";
                        } else {
                            element.style.border = "2px solid #E79F00";
                        }

                        // Use `injectWarningIcon()` to add the tooltip and icon
                        injectWarningIcon(
                            element, 
                            "assets/icons/low_contrast.svg", 
                            `This element has a contrast ratio of ${contrastRatio.toFixed(2)}, which is below the recommended 4.5:1 for readability.`,
                            element.outerHTML
                        );
                    }
                }
            }
        });
    }

    checkContrast();
}

function checkSmallText() {
    let detectSmallTextList = [];
    const elements = document.querySelectorAll('*');

    elements.forEach(function(el) {
        const inlineStyle = el.getAttribute('style');
        if (inlineStyle && inlineStyle.indexOf("font-size") > -1) {
            const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
            if (fontSize < 16) {
                console.warn(`❌ Font size too small in <${el.tagName.toLowerCase()}> element:`, el);

                // Assign a unique class
                const uniqueClass = `detectSmallText-${detectSmallTextList.length}`;
                el.classList.add("detectSmallText");
                el.classList.add(uniqueClass);

                // Add the new class to the list
                detectSmallTextList.push(uniqueClass);

                // Add red border
                el.style.border = "2px solid #E79F00";

                // Use `injectWarningIcon()` to add the tooltip and icon
                injectWarningIcon(
                    el, 
                    "assets/icons/small_text.svg", 
                    `This text is too small (Font size: ${fontSize}px). Recommended size is 16px or larger for readability.`,
                    el.outerHTML
                );
            }
        }
    });

    return detectSmallTextList;
}



//WARNING: Skipped header levels
function checkSkippedHeaderLevels() {
    let lastNumber = 0;
    $("h1, h2, h3, h4, h5, h6").each(function() {
        let currentNumber = parseInt(this.tagName.substring(1));
        if (lastNumber > 0 && currentNumber > lastNumber + 1) {
            console.warn("❌ Skipped header tag found.", this);
        }
        lastNumber = currentNumber;
    })
}

//WARNING: check for lang attribute
function langElementsCheck() {
    let detectMissingLangAttributeList = [];
    const htmlElement = document.documentElement; // Get <html> element
    const langAttribute = htmlElement.getAttribute('lang');

    // Function to create and append a tooltip
    function createTooltip(targetElement, message) {
        let tooltip = document.createElement("div");
        tooltip.className = "manual-tooltip";
        tooltip.innerText = message;

        // Style the tooltip
        tooltip.style.position = "absolute";
        tooltip.style.backgroundColor = "black";
        tooltip.style.color = "white";
        tooltip.style.padding = "5px";
        tooltip.style.borderRadius = "5px";
        tooltip.style.fontSize = "12px";
        tooltip.style.whiteSpace = "nowrap";
        tooltip.style.zIndex = "9999";
        tooltip.style.boxShadow = "0px 0px 10px rgba(0, 0, 0, 0.5)";
        tooltip.style.display = "none"; // Initially hidden

        document.body.appendChild(tooltip);

        // Position tooltip near the target element on hover
        targetElement.addEventListener("mouseenter", () => {
            let rect = targetElement.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.top = `${rect.bottom + window.scrollY + 5}px`;
            tooltip.style.display = "block"; // Show tooltip
        });

        targetElement.addEventListener("mouseleave", () => {
            tooltip.style.display = "none"; // Hide tooltip
        });

        return tooltip;
    }

    // If no lang attribute exists at all
    if (!langAttribute) {
        console.log("❌ No 'lang' attribute found on the <html> element.");

        // Inject warning icon at the top of the page
        let warningIcon = document.createElement("img");
        warningIcon.src = chrome.runtime.getURL("assets/icons/missing_lang_attr.svg");
        warningIcon.alt = "Warning: Missing lang attribute";
        warningIcon.className = "accessibility-warning-icon"; // Add a CSS class for styling

        // Insert the warning icon at the beginning of the body
        document.body.insertBefore(warningIcon, document.body.firstChild);

        // Add tooltip manually (hidden by default, shown on hover)
        createTooltip(warningIcon, "No 'lang' attribute found. A valid language declaration is required.");
    } else if (langAttribute.trim() === "") {
        console.log("❌ 'lang' attribute is present but empty:", htmlElement);

        // Inject warning icon next to <html> tag
        let warningIcon = document.createElement("img");
        warningIcon.src = chrome.runtime.getURL("assets/icons/missing_lang_attr.svg");
        warningIcon.alt = "Warning: Empty lang attribute";
        warningIcon.className = "accessibility-warning-icon";

        htmlElement.insertBefore(warningIcon, htmlElement.firstChild);

        // Add tooltip manually (hidden by default, shown on hover)
        createTooltip(warningIcon, "The 'lang' attribute is empty. A valid language declaration is required.");
    } else {
        console.log("✅ Valid 'lang' attribute found:", langAttribute);
    }

    return detectMissingLangAttributeList;
}




//ERROR : Button Check - no aria label
function buttonElementAccesibleCheck(){
    let buttonElementAccesibleCheckList = [];
    const buttons = document.querySelectorAll('button');
    if (buttons.length == 0) {
    } else {
        buttons.forEach(button => {
            const ariaLabel = button.getAttribute('aria-label');
            const title = button.getAttribute('title');

            // Check and log the cases for no accessible label
            if (!ariaLabel && !title) {
                console.log('❌ Button has no accessible label:', button);
                // Assign a unique class
                const uniqueClass = `buttonElementAccesibleCheck-${buttonElementAccesibleCheckList.length}`;
                button.classList.add('buttonElementAccesibleCheck');
                button.classList.add(uniqueClass);
                // Add the new class to the list
                buttonElementAccesibleCheckList.push(uniqueClass);

                //inject icon
                injectWarningIcon(
                    button, 
                    "assets/icons/broken_button.svg", 
                    "Button has no accessible label", 
                    button.outerHTML
                );
            }
        });
    }
    return buttonElementAccesibleCheckList;
}
//ERROR : Button Check - text only whitespace
function buttonElementWhiteSpaceTextCheck(){
    let buttonElementWhiteSpaceTextCheckList = [];
    const buttons = document.querySelectorAll('button');
    if (buttons.length == 0) {
    } else {
        buttons.forEach(button => {
            const buttonText = button.textContent.trim();

            // Check and log the cases for whitespace only
            if (buttonText === '') {
                console.log('❌ Button has only whitespace:', button);
                // Assign a unique class
                const uniqueClass = `buttonElementWhiteSpaceTextCheck-${buttonElementWhiteSpaceTextCheckList.length}`;
                button.classList.add('buttonElementWhiteSpaceTextCheck');
                button.classList.add(uniqueClass);
                // Add the new class to the list
                buttonElementWhiteSpaceTextCheckList.push(uniqueClass);

                //inject icon
                injectWarningIcon(
                    button, 
                    "assets/icons/broken_button.svg", 
                    "Button has only whitespace", 
                    button.outerHTML
                );
            }
        });
    }
    return buttonElementWhiteSpaceTextCheckList;
}
//ERROR : Button Check - no text
function buttonElementNullTextCheck(){
    let buttonElementNullTextCheckList = [];
    const buttons = document.querySelectorAll('button');
    if (buttons.length == 0) {
    } else {
        buttons.forEach(button => {
            const buttonText = button.textContent.trim();

            // Check and log the cases for no text
            if (buttonText === null) {
                console.log('❌ Button has no text:', button);
                // Assign a unique class
                const uniqueClass = `buttonElementNullTextCheck-${buttonElementNullTextCheckList.length}`;
                button.classList.add('buttonElementNullTextCheck');
                button.classList.add(uniqueClass);
                // Add the new class to the list
                buttonElementNullTextCheckList.push(uniqueClass);

                //inject icon
                injectWarningIcon(
                    button, 
                    "assets/icons/broken_button.svg", 
                    "Button has no text", 
                    button.outerHTML
                );
            }
        });
    }
    return buttonElementNullTextCheckList;
}
//ERROR : Button Check - with icon but no label
function buttonElementNoLabelCheck(){
    let buttonElementNoLabelCheckList = [];
    const buttons = document.querySelectorAll('button');
    if (buttons.length == 0) {
    } else {
        buttons.forEach(button => {
            const buttonText = button.textContent.trim();
            const ariaLabel = button.getAttribute('aria-label');
            const title = button.getAttribute('title');
            const hasIcon = button.querySelector('img, svg') !== null;

            // Check and log the cases for a Button with Only an Icon but No Label
            if (hasIcon && buttonText === '' && !ariaLabel && !title) {
                console.log('❌ Button has only an icon but no text or accessible label:', button);
                // Assign a unique class
                const uniqueClass = `buttonElementNoLabelCheck-${buttonElementNoLabelCheckList.length}`;
                button.classList.add('buttonElementNoLabelCheck');
                button.classList.add(uniqueClass);
                // Add the new class to the list
                buttonElementNoLabelCheckList.push(uniqueClass);

                //inject icon
                injectWarningIcon(
                    button, 
                    "assets/icons/broken_button.svg", 
                    "Button has only an icon but no text or accessible label", 
                    button.outerHTML
                );
            }
        });
    }
    return buttonElementNoLabelCheckList;
}
//ERROR : Button Check - hidden text
function buttonElementHiddenTextCheck(){
    let buttonElementHiddenTextCheckList = [];
    const buttons = document.querySelectorAll('button');
    if (buttons.length == 0) {
    } else {
        buttons.forEach(button => {
            const isHidden = button.style.display === 'none' ||
            button.style.visibility === 'hidden' ||
            parseFloat(button.style.opacity) === 0 ||
            parseFloat(button.style.height) === 0 ||
            parseFloat(button.style.width) === 0;

            // Check and log the case for a button with hidden or visually-invisible text
            if (isHidden) {
                console.log('❌ Button has hidden or visually-invisible text:', button);
                // Assign a unique class
                const uniqueClass = `buttonElementHiddenTextCheck-${buttonElementHiddenTextCheckList.length}`;
                button.classList.add('buttonElementHiddenTextCheck');
                button.classList.add(uniqueClass);
                // Add the new class to the list
                buttonElementHiddenTextCheckList.push(uniqueClass);

                //inject icon
                injectWarningIcon(
                    button, 
                    "assets/icons/broken_button.svg", 
                    "Button has hidden or visually-invisible text", 
                    button.outerHTML
                );
            }
        });
    }
    return buttonElementHiddenTextCheckList;
}
//ERROR : Button Check - empty alt
function buttonElementEmptyAltCheck(){
    let buttonElementEmptyAltCheckList = [];
    const buttons = document.querySelectorAll('button');
    if (buttons.length == 0) {
    } else {
        buttons.forEach(button => {
            const img = button.querySelector('img');

            // Check and log if the image has an alt attribute or if it's empty
            if (img) {
                const altText = img.getAttribute('alt');
                if (!altText) {
                    console.log('❌ Button has an image but no alternative text:', button);
                    // Assign a unique class
                    const uniqueClass = `buttonElementEmptyAltCheck-${buttonElementEmptyAltCheckList.length}`;
                    button.classList.add('buttonElementEmptyAltCheck');
                    button.classList.add(uniqueClass);
                    // Add the new class to the list
                    buttonElementEmptyAltCheckList.push(uniqueClass);

                    //inject icon
                    injectWarningIcon(
                        button, 
                        "assets/icons/broken_button.svg", 
                        "Button has an image but no alternative text", 
                        button.outerHTML
                    );
                }
            }
        });
    }
    return buttonElementEmptyAltCheckList;
}

//WARNING: Redundant link check
function redundantLinkCheck() {
    let detectRedundantLinksList = [];
    const links = document.querySelectorAll('a');  
    const hrefs = new Set();  
    const redundantLinks = [];  

    links.forEach(link => {
        const href = link.getAttribute('href');

        if (href && hrefs.has(href)) {
            // Assign a unique class
            const uniqueClass = `detectRedundantLinks-${detectRedundantLinksList.length}`;
            link.classList.add('detectRedundantLinks');
            link.classList.add(uniqueClass);
            // Add the new class to the list
            detectRedundantLinksList.push(uniqueClass);
            redundantLinks.push(link);
        } else {
            hrefs.add(href);
        }
    });

    if (redundantLinks.length > 0) {
        console.warn(`❌ Redundant Links found (${redundantLinks.length}):`, redundantLinks);

        redundantLinks.forEach(link => {
            // Add red border for visibility
            link.style.border = "2px solid #E79F00";

            // Inject warning icon
            injectWarningIcon(
                link, 
                "assets/icons/redundant_link.svg", 
                "Redundant Link: Multiple links on the same page point to the same destination.", 
                link.outerHTML
            );
        });
    }

    return detectRedundantLinksList;
}

async function collectAccessibilityIssues() {
    const issues = {
        unclosedTags: await detectUnclosedTagsFromDOM(),
        emptyLinks: await detectEmptyLinks(),
        missingHeaders: await detectMissingHeaders(),
        lowContrastText: await checkTextContrast(),
        smallText: await checkSmallText(),
        missingLabels: await checkInputLabels(),
        missingLangAttributes: await langElementsCheck(),
        buttonElementAccesible : await buttonElementAccesibleCheck(),
        buttonElementWhiteSpaceText : await buttonElementWhiteSpaceTextCheck(),
        buttonElementNullText : await buttonElementNullTextCheck(),
        buttonElementNoLabel : await buttonElementNoLabelCheck(),
        buttonElementHiddenText : await buttonElementHiddenTextCheck(),
        buttonElementEmptyAlt : await buttonElementEmptyAltCheck(),
        // buttonIssues: await buttonElementCheck(),
        redundantLinks: await redundantLinkCheck(),
    };

    console.log("🔹 Accessibility issues collected:", issues);

    // Now that issues are ready, create the iframe
    const iframe = document.createElement("iframe");
    iframe.width = "400px";
    iframe.height = "850vh";
    iframe.src = chrome.runtime.getURL('sidebar.html');
    iframe.id = "iframe-container";

    document.body.appendChild(iframe); // Append iframe **after** collecting issues

    console.log("🔹 Sending accessibility issues to background:", issues);

    chrome.runtime.sendMessage(
        { type: "accessibilityIssues", data: issues },
        (response) => {
            if (chrome.runtime.lastError) {
                console.error("❌ Error sending message:", chrome.runtime.lastError);
            } else if (response) {
                console.log("✅ Message sent successfully! Response:", response);
            } else {
                console.warn("⚠️ No response received from background.");
            }
        }
    );
}


// Call the function to detect issues and send them
collectAccessibilityIssues();

async function testGeminiAPI() {
    const apiKey = "AIzaSyAH71xOefWJ4US4G6HE-mQ8AOdsAoApi9M"; // Replace with your actual API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const unclosedTagSize = (detectUnclosedTagsFromDOM()).length;
    const emptyLinkSize = (detectEmptyLinks()).length;
    const redundantLinkSize = (redundantLinkCheck()).length;
    const smallTextSize = (checkSmallText()).length;
    const inputLabelSize = (checkInputLabels()).length;
    const langElementsSize = (langElementsCheck()).length;
    const prompt = `
    Highlight the two biggest accessibility issues on this website, explaining:
    - What they are and why they matter.
    - A quick fix for each.

   Then, briefly list the remaining issues:
    - Unclosed tags: ${unclosedTagSize}
    - Empty links: ${emptyLinkSize}
    - Redundant links: ${redundantLinkSize}
    - Small text: ${smallTextSize}
    - Missing input labels: ${inputLabelSize}
    - Missing language elements: ${langElementsSize}
    Keep it brief and actionable. Please present this summary in a professional and actionable manner.
    `;
    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        const data = await response.json();
        const rawText = data.candidates[0].content.parts[0].text;
        const cleanedText = rawText.replace(/\*\*/g, '').replace(/\*/g, '').trim();
        const displayText = cleanedText;
        //Display it in your HTML (assuming there's an element with id "geminiResponse")
        document.getElementById("aiFixesPage").classList.remove("hidden"); 
        document.getElementById("geminiResponse").innerText = cleanedText;
        console.log("Cleaned Text:", displayText);

    } catch (error) {
        console.error("Error testing Gemini API:", error);
    }
}

//Run the test function
document.addEventListener('DOMContentLoaded', () => {
    console.log('hiii');
    document.getElementById('generateReport').addEventListener('click', function(){
        testGeminiAPI();
    });
});
