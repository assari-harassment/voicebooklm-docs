(function () {
  function loadMermaid() {
    return new Promise(function (resolve, reject) {
      if (window.mermaid) {
        resolve(window.mermaid);
        return;
      }

      var script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
      script.onload = function () {
        resolve(window.mermaid);
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function renderMermaid() {
    var codeBlocks = document.querySelectorAll(
      "pre code.language-mermaid, pre code.language-mermaid-diagram"
    );

    if (codeBlocks.length === 0) {
      return;
    }

    codeBlocks.forEach(function (codeBlock) {
      var pre = codeBlock.parentElement;
      var mermaidContainer = document.createElement("div");
      mermaidContainer.classList.add("mermaid");
      mermaidContainer.textContent = codeBlock.textContent;
      pre.replaceWith(mermaidContainer);
    });

    window.mermaid.initialize({ startOnLoad: false });
    window.mermaid.init(undefined, ".mermaid");
  }

  document.addEventListener("DOMContentLoaded", function () {
    loadMermaid().then(renderMermaid).catch(console.error);
  });
})();
