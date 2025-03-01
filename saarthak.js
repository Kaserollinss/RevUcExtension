$("*").each(function() {
    let fontSize = parseFloat($(this).css("font-size"));
    if (fontSize < 16) {
        console.log("Font size of element is too small.", this)
    }
});

let lastNumber = 0;
$("h1, h2, h3, h4, h5, h6").each(function() {
    let currentNumber = parseInt(this.tagName.substring(1));
    if (lastNumber > 0 && currentNumber > lastNumber + 1) {
        console.log("Skipped header tag found.", this);
    }
    lastNumber = currentNumber;
})