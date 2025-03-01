$(document).ready(function () {
    var inputs = $("input"); // Select all input elements
    console.log(inputs); // Log to console
    
    // Loop through each input and log details
    inputs.each(function(index, element) {
        var inputId = $(element).attr('id');
        var inputName = $(element).attr('name');
        var inputType = $(element).attr('type');
        var inputValue = $(element).val();
        
        // Check if there's a corresponding label
        var hasLabel = false;

        // Check if the <input> has an id and if a <label> with the same "for" attribute exists
        if (inputId && $("label[for='" + inputId + "']").length > 0) {
            hasLabel = true;
        }

        // Check if the <input> is wrapped inside a <label>
        if ($(element).closest('label').length > 0) {
            hasLabel = true;
        }

        // If there's no label associated with the input, log a warning
        if (!hasLabel) {
            console.warn(`Input ${index}: Type=${inputType}, Name=${inputName}, Value=${inputValue} has no corresponding label.`);
        } else {
            console.log(`Input ${index}: Type=${inputType}, Name=${inputName}, Value=${inputValue} has a corresponding label.`);
        }
    });
    
    console.log("LABEL SCRIPT LOADED");
});

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
                        console.warn(`Low contrast detected on ${element[0].tagName}. Ratio: ${contrastRatio.toFixed(2)} (Text: ${color}, BG: ${backgroundColor})`);
                    }
                }
            }
        });
    }

    checkContrast();
    console.log("Contrast script loaded.");
});
