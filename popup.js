document.getElementById('translate-btn').addEventListener('click', async () => {
    const statusDiv = document.getElementById('status');
    statusDiv.innerText = "Folding text...";
    
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const base = 0x4e00;

            // Dein originaler Verschlüsselungs-Algorithmus
            function encode(text) {
                if (!text.trim()) return text; 
                const padded = text + ' '.repeat((3 - text.length % 3) % 3);
                let result = '';
                for (let i = 0; i < padded.length; i += 3) {
                    const a = Math.max(0, Math.min(95, padded[i].codePointAt(0) - 32));
                    const b = Math.max(0, Math.min(95, padded[i+1].codePointAt(0) - 32));
                    const c = Math.max(0, Math.min(95, padded[i+2].codePointAt(0) - 32));
                    result += String.fromCodePoint(base + a * 9216 + b * 96 + c);
                }
                return result;
            }

            // Funktion, um einen DOM-Baum rekursiv zu durchlaufen
            function foldDOM(node) {
                const ignoredTags = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'NOSCRIPT'];
                if (node.parentElement && ignoredTags.includes(node.parentElement.tagName)) {
                    return;
                }

                if (node.nodeType === Node.TEXT_NODE) {
                    // Überprüfen, ob der Text nicht schon verschlüsselt wurde
                    // (Verhindert, dass Text doppelt codiert wird)
                    if (node.nodeValue.trim() && !node.nodeValue.match(/[\u4e00-\u9fa5]/)) {
                        node.nodeValue = encode(node.nodeValue);
                    }
                } else {
                    for (let child of node.childNodes) {
                        foldDOM(child);
                    }
                }
            }

            // 1. Schritt: Übersetze alles, was JETZT gerade auf der Seite steht
            foldDOM(document.body);

            // 2. Schritt: Erstelle den Observer für dynamisch nachladenden Text
            const observer = new MutationObserver((mutationsList) => {
                // Wir schalten den Observer kurz ab, während wir Text ändern,
                // damit das Skript nicht in eine Endlosschleife gerät!
                observer.disconnect();

                for (let mutation of mutationsList) {
                    if (mutation.type === 'childList') {
                        // Wenn neue HTML-Elemente gespawnt werden
                        mutation.addedNodes.forEach(node => foldDOM(node));
                    } else if (mutation.type === 'characterData') {
                        // Wenn sich bestehender Text live verändert
                        foldDOM(mutation.target);
                    }
                }

                // Nachdem wir fertig sind, hören wir wieder aktiv zu
                startObserving();
            });

            function startObserving() {
                observer.observe(document.body, {
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }

            // Starte die Live-Überwachung
            startObserving();
        }
    }, () => {
        statusDiv.innerText = "Live Folding Active! 🥠";
    });
});
