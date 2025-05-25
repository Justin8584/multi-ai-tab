document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById("submit-query");
    const queryInput = document.getElementById("query-input");

    // URL templates for search engines
    const searchEngineUrls = {
        google: (q) => `https://www.google.com/search?q=${encodeURIComponent(q)}`,
        duckduckgo: (q) => `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
        bing: (q) => `https://www.bing.com/search?q=${encodeURIComponent(q)}`,
    };

    // Base URLs for AI platforms
    const aiPlatformUrls = {
        chatgpt: "https://chatgpt.com/",
        claude: "https://claude.ai/",
        gemini: "https://gemini.google.com/",
        deepseek: "https://chat.deepseek.com/",
    };

    submitButton.addEventListener("click", async (e) => {
        e.preventDefault();

        const query = queryInput.value.trim();
        if (!query) {
            alert("Please enter a query");
            return;
        }

        // Get all checked services
        const checkedServices = Array.from(
            document.querySelectorAll('input[type="checkbox"]:checked')
        ).map((checkbox) => checkbox.value);

        if (checkedServices.length === 0) {
            alert("Please select at least one service");
            return;
        }

        // Open tabs for search engines
        checkedServices.forEach((service) => {
            if (searchEngineUrls[service]) {
                chrome.tabs.create({ url: searchEngineUrls[service](query), active: false });
            } else if (aiPlatformUrls[service]) {
                if (service === "chatgpt") {
                    chrome.tabs.create({ url: aiPlatformUrls[service], active: false }, (tab) => {
                        chrome.runtime.sendMessage({
                            type: "OPEN_CHATGPT",
                            tabId: tab.id,
                            query,
                        });
                    });
                } else {
                    chrome.tabs.create({ url: aiPlatformUrls[service], active: false });
                }
            }
        });
    });
});
