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
                console.log("Element found, but 'lang' attribute is null or empty:", element);
            } else {
                console.log("Valid 'lang' attribute found:", langValue, element);
            }
        });
    }
}

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
                console.log('Button has no accessible label:', button);
            }

            // Check and log the cases for whitespace only
            if (buttonText === '') {
                console.log('Button has only whitespace:', button);
            }

            // Check and log the cases for no text
            if (buttonText === null) {
                console.log('Button has no text:', button);
            }

            // Check and log the cases for a Button with Only an Icon but No Label
            if (hasIcon && buttonText === '' && !ariaLabel && !title) {
                console.log('Button has only an icon but no text or accessible label:', button);
            }

            // Check and log the case for a button with hidden or visually-invisible text
            if (isHidden) {
                console.log('Button has hidden or visually-invisible text:', button);
            }

            // Check and log if the image has an alt attribute or if it's empty
            if (img) {
                const altText = img.getAttribute('alt');
                if (!altText) {
                    console.log('Button has an image but no alternative text:', button);
                }
            }
        });
    }
}
buttonElementCheck();
