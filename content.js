// content.js (continued)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.translatedText) {
        const tooltip = document.createElement("div");
        tooltip.textContent = request.translatedText;
        tooltip.style.position = "absolute";
        tooltip.style.backgroundColor = "white";
        tooltip.style.border = "1px solid black";
        tooltip.style.padding = "5px";
        tooltip.style.zIndex = 1000;

        // Position the tooltip near the selected text
        const range = window.getSelection().getRangeAt(0);
        const rect = range.getBoundingClientRect();
        tooltip.style.top = `${rect.bottom + window.scrollY}px`;
        tooltip.style.left = `${rect.left + window.scrollX}px`;

        document.body.appendChild(tooltip);

        // Remove the tooltip after a few seconds
        setTimeout(() => {
            document.body.removeChild(tooltip);
        }, 3000);
    }
});