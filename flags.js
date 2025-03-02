//ERROR: detect unclosed tags
function detectUnclosedTagsFromDOM() {
    const elements = document.body.getElementsByTagName("*");
    const unclosedTags = [];

    Array.from(elements).forEach((el) => {
        const tagName = el.tagName.toLowerCase();
        const isSelfClosing = ["meta", "img", "br", "hr", "input", "link"].includes(tagName);

        if (!isSelfClosing && el.outerHTML.indexOf(`</${tagName}>`) === -1) {
            unclosedTags.push(el);

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
}



//ERROR: detect empty links
function detectEmptyLinks() {
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
            
            // Create and inject the warning icon
            let warningIcon = document.createElement("img");
            warningIcon.src = chrome.runtime.getURL("assets/icons/broken_link.svg");
            warningIcon.alt = "Warning: Broken link";
            warningIcon.className = "accessibility-warning-icon"; // Add a CSS class for styling
            
            // Insert the icon after the empty link
            link.parentNode.insertBefore(warningIcon, link.nextSibling);
        });
    } else {
        console.log("✅ All <a> tags have valid href attributes.");
    }
}


//WARNING: detect missing headers
function detectMissingHeaders() {
    const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6");

    if (headers.length === 0) {
        console.warn("❌ No header tags (h1-h6) detected on this page.");

        // Highlight the body to show the issue
        document.body.style.border = "2px solid red";

        console.warn("Page highlighted with red border due to missing headers.");
    } else {
        console.log(`✅ Found ${headers.length} header tag(s) on this page.`);
    }
}

//WARNING: Check for input labels
function checkInputLabels() {
    $(document).ready(function () {
        var inputs = $("input"); 
        
        inputs.each(function(index, element) {
            var inputId = $(element).attr('id');
            var hasLabel = false;
    
            if (inputId && $("label[for='" + inputId + "']").length > 0) {
                hasLabel = true;
            }
    
            if ($(element).closest('label').length > 0) {
                hasLabel = true;
            }
    
            if (!hasLabel) {
                console.log(`❌ Input ${index} has no corresponding label.`);
    
                // Add red border
                $(element).css("border", "2px solid red");
    
                // Insert warning icon
                var warningIcon = $("<img>", {
                    src: chrome.runtime.getURL("assets/icons/missing_label_header.svg"),
                    alt: "Warning: Missing label",
                    class: "accessibility-warning-icon"
                });
    
                $(element).after(warningIcon);
            }
        });
    });
}



//WARNING: Check good text contrast
function checkTextContrast() {
    $(document).ready(function () {
    
        // Helper function to calculate luminance of a color
        function luminance(rgb) {
            var r = rgb[0] / 255;
            var g = rgb[1] / 255;
            var b = rgb[2] / 255;
    
            r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
            g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
            b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }
    
        // Helper function to calculate the contrast ratio
        function calculateContrast(rgb1, rgb2) {
            var lum1 = luminance(rgb1);
            var lum2 = luminance(rgb2);
            var light = Math.max(lum1, lum2);
            var dark = Math.min(lum1, lum2);
            return (light + 0.05) / (dark + 0.05);
        }
    
        // Convert a color (hex or rgb) to RGB array [r, g, b]
        function hexToRgb(color) {
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
    
        // Function to get the computed background color, accounting for inheritance
        function getEffectiveBackgroundColor(element) {
            let bgColor;
            while (element.length && element[0] !== document) { 
                bgColor = element.css('background-color');
        
                if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                    return bgColor;
                }
        
                // Move up the DOM tree safely
                element = element.parent();
                if (!element.length) break;  // Prevent null reference errors
            }
            return 'rgb(255, 255, 255)'; // Default to white if no background found
        }
        
    
        // Function to check for low contrast
        function checkContrast() {
            $("*").each(function () {
                var element = $(this);
                var color = element.css('color');
                var backgroundColor = element.css('background-color');
        
                if (color && backgroundColor) {
                    var textColor = hexToRgb(color);
                    var bgColor = hexToRgb(backgroundColor);
        
                    if (textColor && bgColor) {
                        var contrastRatio = calculateContrast(textColor, bgColor);
        
                        if (contrastRatio < 4.5) {
                            console.log(`❌ Low contrast detected on ${element[0].tagName}. Ratio: ${contrastRatio.toFixed(2)}`);
        
                            // Add red border
                            element.css("border", "2px solid red");
        
                            // Add warning icon
                            var warningIcon = $("<img>", {
                                src: chrome.runtime.getURL("assets/icons/low_contrast.svg"),
                                alt: "Warning: Low contrast",
                                class: "accessibility-warning-icon"
                            });
        
                            element.after(warningIcon);
                        }
                    }
                }
            });
        }    
        checkContrast();
    });
}

// WARNING: Small text
function checkSmallText() {
    if (this.style && this.style.fontSize) {
        $("*").each(function() {
            let fontSize = parseFloat($(this).css("font-size"));
            if (fontSize < 16) {
                console.warn(`❌ Font size too small in <${this.tagName.toLowerCase()}> element:`, this);
        
                // Add red border
            $(this).css("border", "2px solid red");
    
            // Add warning icon
                var warningIcon = $("<img>", {
                    src: chrome.runtime.getURL("assets/icons/small_text.svg"),
                    alt: "Warning: Small text",
                    class: "accessibility-warning-icon"
                });
        
                $(this).after(warningIcon);
                }
        });
    }
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

            // Check if lang element is null or empty
            if (langValue === null || langValue.trim() === "") {
                console.log("❌ Element found, but 'lang' attribute is null or empty:", element);
            } else {
                console.log("✅ Valid 'lang' attribute found:", langValue, element);
            }
        });
    }
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
    const links = document.querySelectorAll('a');  
    const hrefs = new Set();  
    const redundantLinks = [];  

    links.forEach(link => {
        const href = link.getAttribute('href');

        if (href && hrefs.has(href)) {
            redundantLinks.push(link);
        } else {
            hrefs.add(href);
        }
    });

    if (redundantLinks.length > 0) {
        console.warn(`❌ Redundant Links found (${redundantLinks.length}):`, redundantLinks);

        redundantLinks.forEach(link => {
            // Add red border
            link.style.border = "2px solid red";

            // Insert warning icon
            let warningIcon = document.createElement("img");
            warningIcon.src = chrome.runtime.getURL("assets/icons/redundant_link.svg");
            warningIcon.alt = "Warning: Redundant link";
            warningIcon.className = "accessibility-warning-icon";

            link.parentNode.insertBefore(warningIcon, link.nextSibling);
        });
    }
}



detectUnclosedTagsFromDOM();
detectEmptyLinks();
detectMissingHeaders();
checkTextContrast();
checkSkippedHeaderLevels();
checkSmallText();
checkInputLabels();
langElementsCheck();
buttonElementCheck();
redundantLinkCheck();