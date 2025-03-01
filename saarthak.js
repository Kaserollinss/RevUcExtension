$("*").each(function() {
    let fontSize = parseFloat($(this).css("font-size"));
    if (fontSize < 16) {
        console.log("Font size of element is too small.", this)
    }
});