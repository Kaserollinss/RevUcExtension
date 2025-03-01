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
    
    console.log("SCRIPT LOADED");
});

