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

// Run function on live webpage
//detectUnclosedTagsFromDOM();
