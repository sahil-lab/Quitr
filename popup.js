document.addEventListener("DOMContentLoaded", () => {
  const languageDropdown = document.getElementById("language");

  // Function to fetch and populate languages
  const loadLanguages = async () => {
    try {
      // Fetch available languages from LibreTranslate
      const response = await fetch("https://libretranslate.com/languages");
      if (!response.ok) throw new Error("Failed to fetch languages");

      const languages = await response.json();

      // Clear the loading message
      languageDropdown.innerHTML = ""; // Clear existing options

      // Populate the dropdown
      languages.forEach((lang) => {
        const option = document.createElement("option");
        option.value = lang.code; // Use language code for selection
        option.textContent = lang.name; // Use language name for display
        languageDropdown.appendChild(option);
      });

      // Load the saved language
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.sync.get("targetLanguage", (data) => {
          if (data.targetLanguage) {
            languageDropdown.value = data.targetLanguage;
          }
        });
      }
    } catch (error) {
      console.error("Error loading languages:", error);

      // Show an error message in the dropdown if fetch fails
      const errorOption = document.createElement("option");
      errorOption.value = "";
      errorOption.textContent = "Error loading languages";
      languageDropdown.appendChild(errorOption);
      languageDropdown.disabled = true;
    }
  };

  // Save the selected language to Chrome storage
  const saveLanguage = () => {
    const selectedLanguage = languageDropdown.value;
    console.log("Selected Language:", selectedLanguage);

    if (selectedLanguage) {
      chrome.storage.sync.set({ targetLanguage: selectedLanguage }, () => {
        if (chrome.runtime.lastError) {
          console.error("Error saving language:", chrome.runtime.lastError);
        } else {
          alert("Language saved!"); // Notify user of successful save
        }
      });
    } else {
      alert("Please select a language."); // Alert if no language is selected
    }
  };

  // Attach event listener to the save button
  document.getElementById("save").addEventListener("click", saveLanguage);

  // Load languages when the popup is loaded
  loadLanguages();
});
