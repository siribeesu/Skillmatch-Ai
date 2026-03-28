/**
 * Compare resume skills and job configuration
 * LINEAR POINT ENGINE v4.0 (The "Fair" Matcher)
 */
export function calculateMatchScore(resumeSkills, jobSkillsArray, rawJobText) {
  const resumeMap = new Map();
  if (Array.isArray(resumeSkills)) {
    resumeSkills.forEach(s => {
      if (s && s.name) resumeMap.set(s.name.toLowerCase(), s);
    });
  }

  const cleanJobText = (rawJobText || "").toLowerCase();
  const matched = [];
  const missing = [];
  
  let totalPoints = 0;
  let earnedPoints = 0;

  jobSkillsArray.forEach(jobSkill => {
    const skillNameLower = jobSkill.name.toLowerCase();
    
    // Check if the skill name appears anywhere in the raw text (for description support)
    const escaped = skillNameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    const isPresent = regex.test(cleanJobText);
    
    // LINEAR POINT LOGIC
    const weight = jobSkill.core ? 10 : 4; 
    totalPoints += weight;

    const processedSkill = {
      name: jobSkill.name,
      importance: jobSkill.core ? 'Must-have' : 'Good-to-have',
      weight: weight
    };

    if (resumeMap.has(skillNameLower)) {
      earnedPoints += weight;
      matched.push(processedSkill);
    } else {
      missing.push(processedSkill);
    }
  });

  // Calculate percentage simply: Points Earned / Points Possible
  const matchPercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;

  return {
    matchPercentage,
    matchedSkills: matched,
    missingSkills: missing,
    mustHaveSkills: matched.filter(s => s.importance === 'Must-have'),
    goodToHaveSkills: matched.length - matched.filter(s => s.importance === 'Must-have').length
  };
}
