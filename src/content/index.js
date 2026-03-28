// 💎 [SkillMatch AI] LIGHTWEIGHT CONTENT ENGINE v5.0 (OFFLOAD_MODE ACTIVE)
console.log("💎 [SkillMatch AI] Light Content Script Active.");

// Aggressive Init
(function() {
  const observer = new MutationObserver(debounce(() => {
    try {
      runSuite();
    } catch(e) { /* silent fail for observer */ }
  }, 1800));
  
  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    runSuite();
  }
})();

function runSuite() {
  if (!document.body) return;
  detectJobListPage();
}

/**
 ========================================
 FEATURE: JOB LIST AUTO-BADGE (ASYNC OFFLOAD)
 ========================================
 */
function detectJobListPage() {
  const cardSelectors = [
    '.jobs-search-results-list__list-item', 
    '.job-card-container', 
    '.job_seen_beacon', 
    '.tapItem',
    '[class*="job-card"]',
    'div[role="listitem"]'
  ];
  
  cardSelectors.forEach(sel => {
    try {
      const cards = document.querySelectorAll(sel);
      if (!cards) return;

      cards.forEach(card => {
        try {
          if (!card || card.hasAttribute('data-sm-processed')) return;
          
          const cardText = card.innerText || "";
          if (cardText.length > 50) {
            // MARK AS PROCESSING TO AVOID DOUBLE ANALYZE
            card.setAttribute('data-sm-processed', 'pending');
            
            // OFFLOAD TO BACKGROUND
            console.log("💎 [SkillMatch AI] Analyzing card with text length:", cardText.length);
            chrome.runtime.sendMessage({ action: 'ANALYZE_TEXT', text: cardText }, (response) => {
              if (chrome.runtime.lastError) {
                  console.warn("💀 [SkillMatch AI] Messaging Error:", chrome.runtime.lastError);
                  card.removeAttribute('data-sm-processed');
                  return;
              }

              console.log("💎 [SkillMatch AI] Result Received:", response && response.success ? "SUCCESS" : "FAIL");
              
              if (response && response.success && response.results) {
                if (response.results.matchPercentage > 0) {
                  injectBadge(card, response.results);
                }
                card.setAttribute('data-sm-processed', 'true');
              } else {
                // If it fails, remove pending to allow retry
                card.removeAttribute('data-sm-processed');
              }
            });
          }
        } catch(innerE) { /* ignore single card fails */ }
      });
    } catch(selE) { /* ignore selector fails */ }
  });
}

function injectBadge(card, results) {
  try {
    if (!card || !results) return;
    const badge = document.createElement('div');
    const score = results.matchPercentage || 0;
    const color = score > 70 ? '#10b981' : score > 40 ? '#f59e0b' : '#ef4444';
    
    Object.assign(badge.style, {
      display: 'inline-flex', alignItems: 'center', padding: '3px 10px', borderRadius: '8px',
      backgroundColor: '#f1f5f9', color: color, border: `1px solid ${color}cc`,
      fontSize: '12px', fontWeight: '800', margin: '6px 0',
      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.3)', position: 'relative', zIndex: '10'
    });
    
    badge.innerHTML = `<span style="margin-right:6px;">🎯</span> ${score}% Match`;

    const anchor = card.querySelector('h1, h2, h3, .job-card-list__title, [class*="title"]');
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(badge, anchor.nextSibling);
    } else {
      card.prepend(badge);
    }
  } catch(e) {
    console.error("[SkillMatch AI] Badge Injection Failed:", e);
  }
}

// Utils
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// 🩸 GLOBAL FAILSAFE
window.addEventListener('error', (e) => {
  if (e.message.includes("Extension context invalidated")) {
    console.log("💎 [SkillMatch AI] Context invalidated. Reloading tab...");
  }
});// 📞 LISTEN FOR POPUP COMMANDS
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'EXTRACT_JOB') {
    // Return the most relevant text for the current page
    const text = document.body.innerText || "";
    sendResponse({ success: true, text });
  }
  return true;
});
