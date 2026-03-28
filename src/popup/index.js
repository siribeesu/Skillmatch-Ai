import { parseDocument } from '../utils/parser.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log("💎 [SkillMatch AI] Popup v5.2 ACTIVE.");

  // Elements
  const resumeUpload = document.getElementById('resumeUpload');
  const uploadStatus = document.getElementById('uploadStatus');
  const actionSection = document.getElementById('actionSection');
  const analyzeBtn = document.getElementById('analyzeBtn');
  const reviewSkillsBtn = document.getElementById('reviewSkillsBtn');
  const mySkillsSection = document.getElementById('mySkillsSection');
  const mySkillsList = document.getElementById('mySkillsList');
  const closeSkillsBtn = document.getElementById('closeSkillsBtn');
  const addSkillBtn = document.getElementById('addSkillBtn');
  const newSkillInput = document.getElementById('newSkillInput');
  const loader = document.getElementById('loader');
  const resultsSection = document.getElementById('resultsSection');
  
  // Scoring UI
  const scoreBadge = document.getElementById('scoreBadge');
  const scoreBar = document.getElementById('scoreBar');
  const scoreValue = document.getElementById('scoreValue');
  const matchedList = document.getElementById('matchedSkills');
  const missingList = document.getElementById('missingSkills');
  const closeBtn = document.getElementById('closeBtn');

  if (closeBtn) closeBtn.onclick = () => window.close();

  let resumeSkills = [];

  // Review Skills Toggle
  if (reviewSkillsBtn) {
    reviewSkillsBtn.onclick = () => {
      renderMySkillsList();
      mySkillsSection.classList.remove('hidden');
      actionSection.classList.add('hidden');
      resultsSection.classList.add('hidden');
    };
  }

  if (closeSkillsBtn) {
    closeSkillsBtn.onclick = () => {
      mySkillsSection.classList.add('hidden');
      actionSection.classList.remove('hidden');
    };
  }

  function renderMySkillsList() {
    if (!mySkillsList) return;
    mySkillsList.innerHTML = resumeSkills.length 
      ? resumeSkills.map((s, idx) => `
          <span class="pill" style="background:#eef2ff; color:#4338ca; border-color:#c7d2fe; cursor:pointer;" title="Click to remove" data-idx="${idx}">
            ${s.name} <span style="margin-left:4px; opacity:0.5;">✕</span>
          </span>`).join('')
      : '<p style="font-size:12px; opacity:0.6;">No skills found. Please upload a resume.</p>';

    // Remove logic
    mySkillsList.querySelectorAll('.pill').forEach(pill => {
      pill.onclick = () => {
        const idx = pill.getAttribute('data-idx');
        resumeSkills.splice(idx, 1);
        chrome.storage.local.set({ savedResumeSkills: resumeSkills }, () => {
          renderMySkillsList();
        });
      };
    });
  }

  // ADD MANUAL SKILL
  if (addSkillBtn && newSkillInput) {
    addSkillBtn.onclick = () => {
      const inputVal = newSkillInput.value.trim();
      if (!inputVal) return;
      
      const val = inputVal.toLowerCase();
      // Simple normalization map for common tags
      const normMap = {
          'js': 'JavaScript', 'ts': 'TypeScript', 'py': 'Python', 'reactjs': 'React', 'nodejs': 'Node.js',
          'mongodb': 'MongoDB', 'aws': 'AWS', 'csharp': 'C#', 'cpp': 'C++', 'golang': 'Go', 'ui': 'UI/UX'
      };
      const displayName = normMap[val] || (inputVal.charAt(0).toUpperCase() + inputVal.slice(1));
      
      // Prevent duplicates
      if (!resumeSkills.some(s => s.name.toLowerCase() === val)) {
         resumeSkills.push({ name: displayName, importance: 'Must-have' });
         chrome.storage.local.set({ savedResumeSkills: resumeSkills }, () => {
           newSkillInput.value = '';
           renderMySkillsList();
         });
      }
    };
  }

  // Init storage retrieval
  chrome.storage.local.get(["savedResumeSkills"], (data) => {
    if (data && Array.isArray(data.savedResumeSkills) && data.savedResumeSkills.length > 0) {
      resumeSkills = data.savedResumeSkills;
      if (uploadStatus) {
        uploadStatus.textContent = `✅ Saved Resume Linked (${resumeSkills.length} skills)`;
        uploadStatus.classList.remove('hidden');
      }
      if (actionSection) actionSection.classList.remove('hidden');
    }
  });

  // Upload Logic
  if (resumeUpload) {
    resumeUpload.onchange = async (e) => {
      if (e.target.files && e.target.files.length > 0) {
        try {
          if (uploadStatus) uploadStatus.textContent = "Processing PDF...";
          const text = await parseDocument(e.target.files[0]);
          
          // OFF-LOAD RESUME PARSING TO BRAIN
          chrome.runtime.sendMessage({ action: 'PARSE_RESUME', text: text }, (response) => {
            if (response && response.success && response.skills) {
               chrome.storage.local.set({ savedResumeSkills: response.skills }, () => {
                  window.location.reload(); // Refresh to show linked state
               });
            } else {
               alert("NLP Engine failed to identify skills in this resume.");
            }
          });
        } catch(err) {
          alert("Resume parsing failed: " + err.message);
        }
      }
    };
  }

  // Analyze Logic
  if (analyzeBtn) {
    analyzeBtn.onclick = async () => {
      if (!resumeSkills || resumeSkills.length === 0) {
        alert("Please upload your resume first!");
        return;
      }

      analyzeBtn.classList.add('hidden');
      if (loader) loader.classList.remove('hidden');
      if (resultsSection) resultsSection.classList.add('hidden');

      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const tab = tabs[0];

        // REQUEST TEXT FROM PAGE
        chrome.tabs.sendMessage(tab.id, { action: 'EXTRACT_JOB' }, (response) => {
          if (chrome.runtime.lastError || !response || !response.success) {
            // Fallback to direct script injection
            chrome.scripting.executeScript({
              target: { tabId: tab.id },
              func: () => document.body.innerText
            }).then(results => {
              if (results && results[0] && results[0].result) {
                requestBackgroundMatch(results[0].result);
              } else {
                showError("Content Detection Failed.");
              }
            }).catch(e => showError("Communication Error. Try Refreshing Tab."));
          } else {
            requestBackgroundMatch(response.text);
          }
        });
      } catch(e) { showError("Tab Error."); }
    };
  }

  function requestBackgroundMatch(text) {
    chrome.runtime.sendMessage({ action: 'ANALYZE_TEXT', text: text }, (response) => {
      if (response && response.success && response.results) {
        renderResults(response.results);
      } else {
        showError("The background engine is not responding.");
      }
    });
  }

  function renderResults(results) {
    if (!results) return;
    const { matchPercentage, matchedSkills, missingSkills, isDiscrepancy, experienceDetail } = results;

    if (scoreValue) scoreValue.textContent = matchPercentage;
    if (scoreBar) {
      scoreBar.style.width = matchPercentage + "%";
      scoreBar.className = "progress-bar " + (matchPercentage > 70 ? "score-green" : matchPercentage > 40 ? "score-yellow" : "score-red");
    }

    if (scoreBadge) {
       scoreBadge.textContent = matchPercentage > 70 ? "High Match" : matchPercentage > 40 ? "Fair Match" : "Low Match";
       scoreBadge.className = "badge " + (matchPercentage > 70 ? "safe" : matchPercentage > 40 ? "warning" : "danger");
    }

    // DISCREPANCY ALERT (Static Element Update)
    const alertDiv = document.getElementById('discrepancyAlert');
    if (alertDiv) {
        if (isDiscrepancy) {
            alertDiv.innerHTML = `⚠️ <strong>Experience Conflict:</strong> This role is listed as "Entry Level" but requires <strong>${experienceDetail || "3+ years"}</strong>. Application success may vary.`;
            alertDiv.classList.remove('hidden');
        } else {
            alertDiv.classList.add('hidden');
        }
    }

    if (matchedList) {
       matchedList.innerHTML = matchedSkills.length 
         ? matchedSkills.map(s => `<span class="pill">${s.name}</span>`).join('')
         : '<p style="font-size:12px; opacity:0.6;">No direct matches found.</p>';
    }

    if (missingList) {
       missingList.innerHTML = missingSkills.length
         ? missingSkills.slice(0, 10).map(s => `<div class="gap-item">${s.name}</div>`).join('')
         : '<p style="font-size:12px; color:var(--success-color);">None! You possess the required skill set.</p>';
    }



    if (loader) loader.classList.add('hidden');
    if (analyzeBtn) analyzeBtn.classList.remove('hidden');
    if (resultsSection) resultsSection.classList.remove('hidden');
  }

  function showError(msg) {
    if (loader) loader.classList.add('hidden');
    if (analyzeBtn) analyzeBtn.classList.remove('hidden');
    alert("SkillMatch Brain Error: " + msg);
  }
});
