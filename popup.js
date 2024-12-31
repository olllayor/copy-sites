document.addEventListener("DOMContentLoaded", function () {
  const scrapeButton = document.getElementById("scrapeButton");
  const downloadButton = document.getElementById("downloadButton");
  const copyHtmlButton = document.getElementById("copyHtmlButton");
  const copyCssButton = document.getElementById("copyCssButton");
  const htmlOutput = document.getElementById("htmlOutput");
  const cssOutput = document.getElementById("cssOutput");
  const loadingIndicator = document.getElementById("loading");

  // Scrape Button
  scrapeButton.addEventListener("click", async () => {
    loadingIndicator.style.display = "block";
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scrapeContent,
      });

      const { html, css } = results[0].result;
      htmlOutput.value = html;
      cssOutput.value = css;
    } catch (error) {
      console.error("Scraping failed:", error);
      alert("Failed to scrape the page. Please try again.");
    } finally {
      loadingIndicator.style.display = "none";
    }
  });

  // Download Button
  downloadButton.addEventListener("click", () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadFile(`page-html-${timestamp}.html`, htmlOutput.value);
    downloadFile(`page-css-${timestamp}.css`, cssOutput.value);
  });

  // Copy HTML Button
  copyHtmlButton.addEventListener("click", () => {
    navigator.clipboard
      .writeText(htmlOutput.value)
      .then(() => {
        alert("HTML copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy HTML.");
      });
  });

  // Copy CSS Button
  copyCssButton.addEventListener("click", () => {
    navigator.clipboard
      .writeText(cssOutput.value)
      .then(() => {
        alert("CSS copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy CSS.");
      });
  });
});

function scrapeContent() {
  const html = document.documentElement.outerHTML;
  let css = "";
  for (const sheet of document.styleSheets) {
    try {
      const rules = sheet.cssRules || sheet.rules;
      for (const rule of rules) {
        css += rule.cssText + "\n";
      }
    } catch (e) {
      if (sheet.href)
        css += `/* CSS from ${sheet.href} requires direct access */\n`;
    }
  }
  return { html, css };
}

function downloadFile(filename, content) {
  let mimeType = "text/plain";
  if (filename.endsWith(".html")) {
    mimeType = "text/html";
  } else if (filename.endsWith(".css")) {
    mimeType = "text/css";
  }
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download the file.");
  }
}
