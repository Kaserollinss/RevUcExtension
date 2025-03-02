//ERROR: detect unclosed tags
function detectUnclosedTagsFromDOM() {
    const elements = document.body.getElementsByTagName("*");
    const unclosedTags = [];

    Array.from(elements).forEach((el) => {
        if (el.outerHTML.startsWith("<") && el.outerHTML.endsWith(">")) {
            const tagName = el.tagName.toLowerCase();
            const isSelfClosing = ["meta", "img", "br", "hr", "input", "link"].includes(tagName);

            if (!isSelfClosing && el.outerHTML.indexOf(`</${tagName}>`) === -1) {
                unclosedTags.push(tagName);
            }
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
    const links = document.querySelectorAll("a"); // Get all <a> elements
    const emptyLinks = [];
    links.forEach((link) => {
        if (!link.hasAttribute("href") || link.getAttribute("href").trim() === "") {
            emptyLinks.push(link);
        }
    });
    if (emptyLinks.length > 0) {
        console.warn(`❌ Found ${emptyLinks.length} <a> tags without an href:`, emptyLinks);
        emptyLinks.forEach((link, index) => {
            link.style.border = "2px solid red"; // Highlight them on the page
            console.warn(`Missing href in <a> tag #${index + 1}:`, link.outerHTML);
        });
    } else {
        console.log("✅ All <a> tags have valid href attributes.");
    }
}

//WARNING: detect missing headers
function detectMissingHeaders() {
    const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6"); // Select all header tags

    if (headers.length === 0) {
        console.warn("❌ No header tags (h1-h6) detected on this page.");

        // Highlight the body to show the issue
        document.body.style.border = "5px solid red";
        console.warn("Page highlighted with red border due to missing headers.");
    } else {
        console.log(`✅ Found ${headers.length} header tag(s) on this page.`);
    }
}

//WARNING: Check for input labels
$(document).ready(function () {
    var inputs = $("input"); // Select all input elements
    
    inputs.each(function(index, element) {
        var inputId = $(element).attr('id');
        var inputName = $(element).attr('name');
        var inputType = $(element).attr('type');
        var inputValue = $(element).val();
        
        var hasLabel = false;

        if (inputId && $("label[for='" + inputId + "']").length > 0) {
            hasLabel = true;
        }

        if ($(element).closest('label').length > 0) {
            hasLabel = true;
        }

        if (!hasLabel) {
            //console.warn(`Input ${index}: Type=${inputType}, Name=${inputName} has no corresponding label.`);
            console.log(`❌Input ${index}: Type=${inputType}, Name=${inputName} has no corresponding label.`);
            
            // Create warning icon
            var warningIcon = $("<img>", {
                src: chrome.runtime.getURL("assets/icons/warning.svg"),
                alt: "Warning: Missing label",
                class: "accessibility-warning-icon"
            });

            // Insert the warning icon after the input field
            $(element).after(warningIcon);
        } else {
            console.log("✅ No missing input labels.")
        }
    });
});


//WARNING: Check good text contrast
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
            var backgroundColor = getEffectiveBackgroundColor(element);
    
            if (color && backgroundColor) {
                var textColor = hexToRgb(color);
                var bgColor = hexToRgb(backgroundColor);
    
                if (textColor && bgColor) {
                    var contrastRatio = calculateContrast(textColor, bgColor);
    
                    if (contrastRatio < 4.5) {
                        //console.warn(`Low contrast detected on ${element[0].tagName}. Ratio: ${contrastRatio.toFixed(2)}`);
                        console.log(`❌ Low contrast detected on ${element[0].tagName}. Ratio: ${contrastRatio.toFixed(2)}`);
                        
                        // Add warning icon
                        var warningIcon = $("<img>", {
                            src: chrome.runtime.getURL("assets/icons/warning.svg"),
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

// WARNING: Small text
$("*").each(function() {
    if (this.style && this.style.fontSize) {
        let fontSize = parseFloat($(this).css("font-size"));
        if (fontSize < 16) {
            console.log(`❌ Font size too small in <${this.tagName.toLowerCase()}> element:`, this);

            // Add warning icon next to the element
            var warningIcon = $("<img>", {
                src: chrome.runtime.getURL("assets/icons/warning.svg"),
                alt: "Warning: Small text",
                class: "accessibility-warning-icon"
            });

            $(this).after(warningIcon);
        }
    }
});


//WARNING: Skipped header levels
let lastNumber = 0;
$("h1, h2, h3, h4, h5, h6").each(function() {
    let currentNumber = parseInt(this.tagName.substring(1));
    if (lastNumber > 0 && currentNumber > lastNumber + 1) {
        console.log("Skipped header tag found.", this);
    }
    lastNumber = currentNumber;
})

//WARNING: check for lang attribute
function langElementsCheck (){
    const langElements = document.querySelectorAll('[lang]');
        console.log(langElements)

    //Check if it has no lang elements
    if (langElements.length === 0) {
        console.log("No elements with a 'lang' attribute found.");
    }

    else{
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

    if (buttons.length == 0) {
        console.log('No buttons found in the page');
    } else {
        buttons.forEach(button => {
            const buttonText = button.textContent.trim();
            const ariaLabel = button.getAttribute('aria-label');
            const title = button.getAttribute('title');
            const hasIcon = button.querySelector('img, svg') !== null;
            const style = window.getComputedStyle(button);
            const isHidden = style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0 || parseFloat(style.height) === 0 || parseFloat(style.width) === 0;
            const img = button.querySelector('img');
            
            // Check and log the cases for no accessible label
            if (!ariaLabel && !title) {
                console.log('❌ Button has no accessible label:', button);
            }

            // Check and log the cases for whitespace only
            if (buttonText === '') {
                console.log('❌ Button has only whitespace:', button);
            }

            // Check and log the cases for no text
            if (buttonText === null) {
                console.log('❌ Button has no text:', button);
            }

            // Check and log the cases for a Button with Only an Icon but No Label
            if (hasIcon && buttonText === '' && !ariaLabel && !title) {
                console.log('❌ Button has only an icon but no text or accessible label:', button);
            }

            // Check and log the case for a button with hidden or visually-invisible text
            if (isHidden) {
                console.log('❌ Button has hidden or visually-invisible text:', button);
            }

            // Check and log if the image has an alt attribute or if it's empty
            if (img) {
                const altText = img.getAttribute('alt');
                if (!altText) {
                    console.log('❌ Button has an image but no alternative text:', button);
                }
            }
        });
    }
}

//WARNING: Redundant link check
function redundantLinkCheck(){
    const links = document.querySelectorAll('a');  // Get all <a> elements
    const hrefs = new Set();  // To store unique hrefs
    const redundantLinks = [];  // To store redundant links
    
    // Iterate over all links
    links.forEach(link => {
        const href = link.getAttribute('href');
        
        // Check if the href is already encountered
        if (href && hrefs.has(href)) {
            redundantLinks.push(link);  // Add the redundant link to the array
        } else {
            hrefs.add(href);  // Otherwise, add the href to the set
        }
    });
    
    // If redundant links are found, print them
    if (redundantLinks.length > 0) {
        console.log('❌ Redundant Links found:');
        redundantLinks.forEach(link => {
            console.log(link);
        });
    } else {
        console.log('✅ No redundant links found.');
    }
}

detectUnclosedTagsFromDOM();
detectEmptyLinks();
detectMissingHeaders();
langElementsCheck();
buttonElementCheck();
redundantLinkCheck();