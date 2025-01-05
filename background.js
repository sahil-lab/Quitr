chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate",
    title: "Translate Selected Text",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate" && info.selectionText) {
    chrome.storage.sync.get("targetLanguage", async (data) => {
      const targetLanguage = data.targetLanguage || "en";
      const translations = await fetchTranslations(info.selectionText, ["en", targetLanguage]);

      chrome.storage.sync.set({ lastTranslations: translations }); // Save for TTS
      showPopup(tab.id, translations);
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.text) {
    chrome.storage.sync.get("targetLanguage", async (data) => {
      const targetLanguage = data.targetLanguage || 'en'; // Default to English if not set
      const translatedText = await translateText(request.text, targetLanguage);
      sendResponse({ translatedText });
    });
    return true; // Keep the message channel open for sendResponse
  }
});

async function translateText(text, targetLanguage) {
  const response = await fetch("https://libretranslate.com/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: text, source: "auto", target: targetLanguage }),
  });
  const data = await response.json();
  return data.translatedText;
}

async function fetchTranslations(text, languages) {
  const translations = {};
  for (const lang of languages) {
    const response = await fetch(`https://libretranslate.com/translate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: text, source: "auto", target: lang }),
    });
    const data = await response.json();
    translations[lang] = data.translatedText;
  }
  return translations;
}

function showPopup(tabId, translations) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (translations) => {
      // ... existing popup creation code ...

      // Add each translation with TTS buttons
      for (const [lang, text] of Object.entries(translations)) {
        // ... existing translation display code ...

        // Add TTS button
        const ttsButton = document.createElement("button");
        ttsButton.textContent = `Play (${lang})`;
        // ... existing button styling code ...

        ttsButton.onclick = () => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = lang;
          window.speechSynthesis.speak(utterance);
        };

        popup.appendChild(ttsButton);
      }

      // ... existing code to append popup to body ...
    },
    args: [translations],
  });
}

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
