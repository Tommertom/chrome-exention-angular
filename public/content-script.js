// This script runs in the context of the web page
chrome.runtime.sendMessage({ action: "registerTab" }, (response) => {
  console.log(
    "[CONTENT SCRIPT] Response from background script after registering tab:",
    response
  );
  if (chrome.runtime.lastError) {
    console.warn(
      "[CONTENT SCRIPT] Error sending message to background:",
      chrome.runtime.lastError
    );
  } else {
    console.log("[CONTENT SCRIPT] Registered tab with background:", response);
  }
});

///////////////////////////

// Check if script is already injected to avoid duplicates
if (window.contentScriptInjected) {
  console.log("Content script already injected, skipping initialization");
} else {
  window.contentScriptInjected = true;

  console.log(
    "[CONTENT SCRIPT] Content script initializing on:",
    window.location.href
  );

  // Notify service worker that content script is loaded
  try {
    chrome.runtime.sendMessage({
      type: "CONTENT_SCRIPT_LOADED",
      url: window.location.href,
    });
    console.log("[CONTENT SCRIPT] Sent CONTENT_SCRIPT_LOADED message");
  } catch (error) {
    console.error("[CONTENT SCRIPT] Failed to send load notification:", error);
  }

  // Function to display a small message box in the top-left corner
  function showMessageBox() {
    // Load the message box HTML from a static file
    fetch(chrome.runtime.getURL("message-box.html"))
      .then((response) => response.text())
      .then((html) => {
        console.log(
          "[CONTENT SCRIPT] Message box HTML loaded successfully",
          html
        );
        // Create a container element
        const container = document.createElement("div");
        container.innerHTML = html;

        // Get the actual message box element from the loaded HTML
        const box = container.firstChild;

        // Add the box to the page
        document.body.appendChild(box);
        console.log("[CONTENT SCRIPT] Message box loaded and displayed");
      })
      .catch((error) => {
        console.error(
          "[CONTENT SCRIPT] Failed to load message box HTML:",
          error
        );
      });
  }

  // Listen for messages from the service worker
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[CONTENT SCRIPT] Content script received message:", message);

    sendResponse({ success: true, message });

    return true;
  });

  // Display the message box
  showMessageBox();

  console.log(
    "[CONTENT SCRIPT] Content script fully loaded on:",
    window.location.href
  );
}
