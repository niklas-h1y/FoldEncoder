document.getElementById('translate-btn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    statusDiv.innerText = "Folding text...";
    
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const base = 0x4e00;

            // Your exact original encoding algorithm
            function encode(text) {
                if (!text.trim()) return text; // Skip purely empty spacing blocks
                const padded = text + ' '.repeat((3 - text.length % 3) % 3);
                let result = '';
                for (let i = 0; i < padded.length; i += 3) {
                    const a = Math.max(0, Math.min(95, padded[i].codePointAt(0) - 32));
                    const b = Math.max(0, Math.min(95, padded[i + 1].codePointAt(0) - 32));
                    const c = Math.max(0, Math.min(95, padded[i + 2].codePointAt(0) - 32));
                    result += String.fromCodePoint(base + a * 9216 + b * 96 + c);
                }
                return result;
            }

            // Recursive function to step through the DOM tree safely
            function foldDOM(node) {
                // Ignore script elements, styles, and inputs so the app logic doesn't crash
                const ignoredTags = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'NOSCRIPT'];
                if (node.parentElement && ignoredTags.includes(node.parentElement.tagName)) {
                    return;
                }

                // If it's a pure text element node, encode its value
                if (node.nodeType === Node.TEXT_NODE) {
                    node.nodeValue = encode(node.nodeValue);
                } else {
                    // Loop through all nested child elements
                    for (let child of node.childNodes) {
                        foldDOM(child);
                    }
                }
            }

            // Fire the translation on the body element
            foldDOM(document.body);
        }
    }, () => {
        statusDiv.innerText = "Page Folded! 🥠";
    });
});
