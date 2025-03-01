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

// Run the function
detectMissingHeaders();
