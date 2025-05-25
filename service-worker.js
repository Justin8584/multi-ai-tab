// Listen for tab updates
const chatgptTabs = {};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "OPEN_CHATGPT" && msg.tabId && msg.query) {
        chatgptTabs[msg.tabId] = msg.query;
    }
});

function injectChatGPTPrompt(query) {
    // This function runs in the context of the page
    console.log("[Multi-AI Tab] ChatGPT content script loaded");
    function injectQuery() {
        try {
            const inputDiv = document.querySelector('div#prompt-textarea[contenteditable="true"]');
            const sendBtn = document.querySelector(
                'button#composer-submit-button[data-testid="send-button"]'
            );
            if (inputDiv && sendBtn) {
                inputDiv.innerText = query;
                inputDiv.dispatchEvent(new Event("input", { bubbles: true }));
                setTimeout(() => {
                    sendBtn.click();
                }, 100);
                console.log("[Multi-AI Tab] Query injected and send clicked.");
                return true;
            }
        } catch (err) {
            console.error("[Multi-AI Tab] ChatGPT injection error:", err);
        }
        return false;
    }

    // Use MutationObserver for dynamic loading
    const observer = new MutationObserver(() => {
        if (injectQuery()) {
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Fallback: poll for up to 12s
    const pollInterval = setInterval(() => {
        if (injectQuery()) {
            clearInterval(pollInterval);
            observer.disconnect();
        }
    }, 400);
    setTimeout(() => {
        clearInterval(pollInterval);
        observer.disconnect();
        console.warn("[Multi-AI Tab] Gave up injecting after 12s");
    }, 12000);
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (
        changeInfo.status === "complete" &&
        chatgptTabs[tabId] &&
        tab.url &&
        tab.url.startsWith("https://chatgpt.com/")
    ) {
        chrome.scripting.executeScript({
            target: { tabId },
            func: injectChatGPTPrompt,
            args: [chatgptTabs[tabId]],
        });
        delete chatgptTabs[tabId];
    }
});
