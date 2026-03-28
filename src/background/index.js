import { extractSkillsNLP } from '../utils/nlp.js';
import { calculateMatchScore } from '../utils/scoring.js';

console.log("💎 [SkillMatch AI Brain] Background Worker Initialized.");

// AGGRESSIVE ERROR CAPTURE
try {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("📩 [SkillMatch AI Brain] Message Received:", request.action);
    
    if (request.action === 'ANALYZE_TEXT') {
      try {
        const text = request.text || "";
        if (!text) {
            sendResponse({ success: false, error: "Empty text provided" });
            return false;
        }

        chrome.storage.local.get(["savedResumeSkills"], (data) => {
          try {
            const resumeSkills = (data && Array.isArray(data.savedResumeSkills)) ? data.savedResumeSkills : [];
            console.log("📄 [SkillMatch AI Brain] Loaded Resume Skills:", resumeSkills.length);
            
            const jobSkills = extractSkillsNLP(text);
            console.log("🔍 [SkillMatch AI Brain] Extracted Job Skills:", jobSkills.length);
            
            const results = calculateMatchScore(resumeSkills, jobSkills, text);
            
            const lowerText = text.toLowerCase();
            const isEntryLevel = lowerText.includes("entry level") || lowerText.includes("junior") || lowerText.includes("fresher");
            
            // Modern detection for "X years experience" or "X-Y years experience"
            const expRegex = /(\d+(?:-\d+)?)\s*\+?\s*years?[\w\s]{0,20}(?:experience|exp|work|industry)/gi;
            const expMatches = text.match(expRegex);
            
            let detectedYears = 0;
            if (expMatches) {
                // Get the first number found (usually the minimum years required)
                const numbers = expMatches[0].match(/\d+/);
                if (numbers) detectedYears = parseInt(numbers[0]);
            }
            
            results.isDiscrepancy = isEntryLevel && detectedYears >= 3;
            results.experienceDetail = expMatches ? expMatches[0] : null;

            if (results.isDiscrepancy) console.log("⚠️ [SkillMatch AI Brain] DISCREPANCY DETECTED:", results.experienceDetail);
            
            console.log("🎯 [SkillMatch AI Brain] Result Score:", results.matchPercentage + "%");
            
            sendResponse({ success: true, results });
          } catch (innerE) {
            console.error("🩸 [SkillMatch AI Brain] Matching Loop Error:", innerE);
            sendResponse({ success: false, error: "Matching error" });
          }
        });
      } catch (outerE) {
        console.error("🩸 [SkillMatch AI Brain] Outer Analyzer Error:", outerE);
        sendResponse({ success: false, error: "Analyzer setup error" });
      }
      return true; // Keep channel open
    }
    
    if (request.action === 'PARSE_RESUME') {
      try {
        const skills = extractSkillsNLP(request.text || "");
        sendResponse({ success: true, skills });
      } catch (e) {
        console.error("🩸 [SkillMatch AI Brain] Resume Parsing Error:", e);
        sendResponse({ success: false, error: e.message });
      }
      return true;
    }
  });
} catch (globalE) {
  console.error("💀 [SkillMatch AI Brain] Fatal Worker Error:", globalE);
}
