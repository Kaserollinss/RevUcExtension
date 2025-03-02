//TOOLTIP AND ICON INJECTION FUNCTION
function injectWarningIcon(element, iconPath, explanation, htmlCode) {
    if (!element) {
        console.error("❌ injectWarningIcon called with an undefined element!");
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
    htmlCodeSection.innerText = htmlCode.trim(); // Display problematic HTML

    // Append sections to tooltip
    tooltip.appendChild(explanationSection);
    tooltip.appendChild(htmlCodeSection);

    // Wrap icon inside a span for better styling
    let iconContainer = document.createElement("span");
    iconContainer.className = "accessibility-icon-container";
    iconContainer.appendChild(warningIcon);
    iconContainer.appendChild(tooltip); // Append tooltip

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

    // Check if tooltip is off-screen to the right
    if (tooltipRect.right > viewportWidth) {
        tooltip.style.left = "auto";
        tooltip.style.right = "0";
        tooltip.style.transform = "translateX(0)";
    }

    // Check if tooltip is off-screen to the left
    if (tooltipRect.left < 0) {
        tooltip.style.left = "0";
        tooltip.style.transform = "translateX(0)";
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

//WARNING: Check for input labels
function checkInputLabels() {
    let detectMissingLabelsList = [];
    const inputs = document.querySelectorAll("input");

    inputs.forEach(function(element, index) {
        const inputId = element.getAttribute('id');
        let hasLabel = false;
    const inputs = document.querySelectorAll("input");

    inputs.forEach(function(element, index) {
        const inputId = element.getAttribute('id');
        let hasLabel = false;

        // Check if an input has a corresponding label with a "for" attribute matching its id
        if (inputId && document.querySelectorAll("label[for='" + inputId + "']").length > 0) {
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
                el.style.border = "2px solid red";

                // Use `injectWarningIcon()` to add the tooltip and icon
                injectWarningIcon(
                    this, 
                    "assets/icons/small_text.svg", 
                    `This text is too small (Font size: ${fontSize}px). Recommended size is 16px or larger for readability.`,
                    this.outerHTML
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
    const langElements = document.querySelectorAll('[lang]');
    console.log(langElements);

    // Check if the page has no elements with a 'lang' attribute
    if (langElements.length === 0) {
        console.log("❌ No elements with a 'lang' attribute found.");

        // Inject warning icon at the top of the page
        let warningIcon = document.createElement("img");
        warningIcon.src = chrome.runtime.getURL("assets/icons/missing_lang_attr.svg");
        warningIcon.alt = "Warning: Missing lang attribute";
        warningIcon.className = "accessibility-warning-icon"; // Add a CSS class for styling

        // Insert the warning icon at the beginning of the body
        document.body.insertBefore(warningIcon, document.body.firstChild);
    } else {
        langElements.forEach(element => {
            const langValue = element.getAttribute('lang'); // Get lang attribute value
            // Assign a unique class
            const uniqueClass = `detectMissingLangAttribute-${detectMissingLangAttributeList?.length || 0}`;
            element.classList.add('detectMissingLangAttribute');
            element.classList.add(uniqueClass);
            // Add the new class to the list
            detectMissingLangAttributeList.push(uniqueClass);

            // Check if lang element is null or empty
            if (langValue === null || langValue.trim() === "") {
                console.log("❌ Element found, but 'lang' attribute is null or empty:", element);
            } else {
                console.log("✅ Valid 'lang' attribute found:", langValue, element);
            }
        });
    }
    return detectMissingLangAttributeList;
}

//ERROR: Button check
function buttonElementCheck() {
    const buttons = document.querySelectorAll('button');

    if (buttons.length === 0) {
        console.log('✅ No buttons found on the page.');
        return;
    }

    buttons.forEach(button => {
        const buttonText = button.textContent.trim();
        const ariaLabel = button.getAttribute('aria-label');
        const title = button.getAttribute('title');
        const hasIcon = button.querySelector('img, svg') !== null;
        const style = window.getComputedStyle(button);
        const isHidden = style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0 || parseFloat(style.height) === 0 || parseFloat(style.width) === 0;
        const img = button.querySelector('img');

        let isProblematic = false;
        let issues = [];

        // Check for missing accessible labels
        if (!ariaLabel && !title) {
            issues.push('No accessible label');
            isProblematic = true;
        }

        // Check for whitespace-only or missing text
        if (buttonText === '') {
            issues.push('Only whitespace or no text');
            isProblematic = true;
        }

        // Check for button with only an icon but no label
        if (hasIcon && buttonText === '' && !ariaLabel && !title) {
            issues.push('Only an icon, no label');
            isProblematic = true;
        }

        // Check for hidden or visually-invisible text
        if (isHidden) {
            issues.push('Hidden or visually-invisible text');
            isProblematic = true;
        }

        // Check for images without alternative text
        if (img) {
            const altText = img.getAttribute('alt');
            if (!altText) {
                issues.push('Image in button has no alternative text');
                isProblematic = true;
            }
        }

        // Log issues and inject warning icon if necessary
        if (isProblematic) {
            console.warn(`❌ Button issue(s): ${issues.join(', ')}`, button);
            button.style.border = "2px solid red";
            // Inject warning icon
            let warningIcon = document.createElement("img");
            warningIcon.src = chrome.runtime.getURL("assets/icons/broken_button.svg");
            warningIcon.alt = "Warning: Inaccessible button";
            warningIcon.className = "accessibility-warning-icon"; // Add a CSS class for styling

            // Insert the icon after the problematic button
            button.parentNode.insertBefore(warningIcon, button.nextSibling);
        }
    });
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
            const uniqueClass = `detectRedundantLinks-${detectRedundantLinksList?.length || 0}`;
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
            // Add red border
            link.style.border = "2px solid #E79F00";

            // Insert warning icon
            let warningIcon = document.createElement("img");
            warningIcon.src = chrome.runtime.getURL("assets/icons/redundant_link.svg");
            warningIcon.alt = "Warning: Redundant link";
            warningIcon.className = "accessibility-warning-icon";

            link.parentNode.insertBefore(warningIcon, link.nextSibling);
        });
    }
    return detectRedundantLinksList;
}



// detectUnclosedTagsFromDOM();
// detectEmptyLinks();
// detectMissingHeaders();
// checkTextContrast();
// checkSkippedHeaderLevels();
// checkSmallText();
// checkInputLabels();
// langElementsCheck();
// buttonElementCheck();
// redundantLinkCheck();

function collectAccessibilityIssues() {
    const issues = {
        unclosedTags: detectUnclosedTagsFromDOM(),
        emptyLinks: detectEmptyLinks(),
        missingHeaders: detectMissingHeaders(),
        lowContrastText: checkTextContrast(),
        smallText: checkSmallText(),
        missingLabels: checkInputLabels(),
        missingLangAttributes: langElementsCheck(),
        buttonIssues: buttonElementCheck(),
        redundantLinks: redundantLinkCheck(),
    };

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
        Based on the following data, please provide a detailed summary for the user. The summary should include:

        1. An explanation of each error found on the website, describing what each error means.
        2. An explanation of why these errors are important, particularly from an accessibility perspective.
        3. Suggestions on how to resolve these issues, along with recommendations to improve website accessibility and reduce potential accessibility issues.

        Here is the data:
        - Unclosed tags: ${unclosedTagSize}
        - Empty links: ${emptyLinkSize}
        - Redundant links: ${redundantLinkSize}
        - Small text elements: ${smallTextSize}
        - Missing input labels: ${inputLabelSize}
        - Language elements: ${langElementsSize}
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
        // Display it in your HTML (assuming there's an element with id "geminiResponse")
        //document.getElementById("geminiResponse").innerText = displayText;
        console.log("Cleaned Text:", displayText);

    } catch (error) {
        console.error("Error testing Gemini API:", error);
    }
}

// Run the test function
document.addEventListener('DOMContentLoaded', () => {
    console.log('hiii');
    document.getElementById('generateReport').addEventListener('click', function(){
        testGeminiAPI();
    });
});
