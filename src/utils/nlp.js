import nlp from 'compromise';

// Common technical skills blocklist
const stopWords = new Set(['software', 'development', 'system', 'end', 'data', 'using', 'application', 'team', 'work', 'years', 'experience', 'business']);

// Skill Dictionary with importance weight
export const techDictionary = {
  // Programming Languages
  'javascript': { cat: 'language', name: 'JavaScript', core: true },
  'js': { cat: 'language', name: 'JavaScript', core: true },
  'typescript': { cat: 'language', name: 'TypeScript', core: true },
  'ts': { cat: 'language', name: 'TypeScript', core: true },
  'python': { cat: 'language', name: 'Python', core: true },
  'py': { cat: 'language', name: 'Python', core: true },
  'java': { cat: 'language', name: 'Java', core: true },
  'c++': { cat: 'language', name: 'C++', core: true },
  'cpp': { cat: 'language', name: 'C++', core: true },
  'c#': { cat: 'language', name: 'C#', core: true },
  'csharp': { cat: 'language', name: 'C#', core: true },
  'go': { cat: 'language', name: 'Go', core: true },
  'golang': { cat: 'language', name: 'Go', core: true },
  'ruby': { cat: 'language', name: 'Ruby', core: true },
  'php': { cat: 'language', name: 'PHP', core: false },
  'rust': { cat: 'language', name: 'Rust', core: true },
  'kotlin': { cat: 'language', name: 'Kotlin', core: true },
  'swift': { cat: 'language', name: 'Swift', core: true },
  'dart': { cat: 'language', name: 'Dart', core: true },
  
  // Frontend
  'react': { cat: 'framework', name: 'React', core: true },
  'reactjs': { cat: 'framework', name: 'React', core: true },
  'react.js': { cat: 'framework', name: 'React', core: true },
  'vue': { cat: 'framework', name: 'Vue.js', core: true },
  'vuejs': { cat: 'framework', name: 'Vue.js', core: true },
  'vue.js': { cat: 'framework', name: 'Vue.js', core: true },
  'angular': { cat: 'framework', name: 'Angular', core: true },
  'angularjs': { cat: 'framework', name: 'Angular', core: true },
  'svelte': { cat: 'framework', name: 'Svelte', core: true },
  'html': { cat: 'frontend', name: 'HTML5', core: false },
  'html5': { cat: 'frontend', name: 'HTML5', core: false },
  'css': { cat: 'frontend', name: 'CSS3', core: false },
  'css3': { cat: 'frontend', name: 'CSS3', core: false },
  'tailwind': { cat: 'frontend', name: 'Tailwind CSS', core: false },
  'tailwindcss': { cat: 'frontend', name: 'Tailwind CSS', core: false },
  'bootstrap': { cat: 'frontend', name: 'Bootstrap', core: false },
  'sass': { cat: 'frontend', name: 'SASS/SCSS', core: false },
  'scss': { cat: 'frontend', name: 'SASS/SCSS', core: false },
  'nextjs': { cat: 'framework', name: 'Next.js', core: true },
  'next.js': { cat: 'framework', name: 'Next.js', core: true },
  
  // Backend & DB
  'node': { cat: 'backend', name: 'Node.js', core: true },
  'node.js': { cat: 'backend', name: 'Node.js', core: true },
  'nodejs': { cat: 'backend', name: 'Node.js', core: true },
  'express': { cat: 'backend', name: 'Express.js', core: false },
  'expressjs': { cat: 'backend', name: 'Express.js', core: false },
  'django': { cat: 'backend', name: 'Django', core: true },
  'flask': { cat: 'backend', name: 'Flask', core: true },
  'spring': { cat: 'backend', name: 'Spring Boot', core: true },
  'springboot': { cat: 'backend', name: 'Spring Boot', core: true },
  'fastapi': { cat: 'backend', name: 'FastAPI', core: true },
  'sql': { cat: 'database', name: 'SQL', core: true },
  'mysql': { cat: 'database', name: 'MySQL', core: false },
  'postgres': { cat: 'database', name: 'PostgreSQL', core: true },
  'postgresql': { cat: 'database', name: 'PostgreSQL', core: true },
  'mongodb': { cat: 'database', name: 'MongoDB', core: true },
  'mongo': { cat: 'database', name: 'MongoDB', core: true },
  'redis': { cat: 'database', name: 'Redis', core: false },
  'graphql': { cat: 'api', name: 'GraphQL', core: true },
  'rest': { cat: 'api', name: 'REST API', core: false },
  
  // Cloud & DevOps
  'aws': { cat: 'cloud', name: 'AWS', core: true },
  'amazon web services': { cat: 'cloud', name: 'AWS', core: true },
  'azure': { cat: 'cloud', name: 'Azure', core: true },
  'gcp': { cat: 'cloud', name: 'Google Cloud Platform', core: true },
  'google cloud': { cat: 'cloud', name: 'Google Cloud Platform', core: true },
  'docker': { cat: 'devops', name: 'Docker', core: true },
  'kubernetes': { cat: 'devops', name: 'Kubernetes', core: true },
  'k8s': { cat: 'devops', name: 'Kubernetes', core: true },
  'ci/cd': { cat: 'devops', name: 'CI/CD', core: true },
  'jenkins': { cat: 'devops', name: 'Jenkins', core: true },
  'terraform': { cat: 'devops', name: 'Terraform', core: true },
  'ansible': { cat: 'devops', name: 'Ansible', core: true },
  'git': { cat: 'tool', name: 'Git', core: false },
  'github': { cat: 'tool', name: 'GitHub', core: false },
  'linux': { cat: 'os', name: 'Linux', core: false },
  
  // AI/ML & Data
  'machine learning': { cat: 'ai', name: 'Machine Learning', core: true },
  'ml': { cat: 'ai', name: 'Machine Learning', core: true },
  'artificial intelligence': { cat: 'ai', name: 'AI', core: true },
  'ai': { cat: 'ai', name: 'AI', core: true },
  'nlp': { cat: 'ai', name: 'NLP', core: true },
  'tensorflow': { cat: 'ai', name: 'TensorFlow', core: true },
  'pytorch': { cat: 'ai', name: 'PyTorch', core: true },
  'keras': { cat: 'ai', name: 'Keras', core: true },
  'scikit': { cat: 'ai', name: 'Scikit-Learn', core: true },
  'pandas': { cat: 'data', name: 'Pandas', core: true },
  'numpy': { cat: 'data', name: 'NumPy', core: true },
  'spark': { cat: 'data', name: 'Apache Spark', core: true },
  'hadoop': { cat: 'data', name: 'Hadoop', core: true },
  'llm': { cat: 'ai', name: 'LLM', core: true },
  'langchain': { cat: 'ai', name: 'LangChain', core: true },
  'openai': { cat: 'ai', name: 'OpenAI', core: true }
};

export function extractSkillsNLP(text) {
  if (!text) return [];

  const cleanText = text.replace(/[^a-zA-Z0-9\+\-\.# ]/g, ' ').toLowerCase();
  const doc = nlp(cleanText);
  const terms = doc.terms().out('array');
  const extracted = new Map();

  const addSkill = (word) => {
    word = word.trim();
    if (word.length < 2) return;
    
    // Check if word is in dictionary. If so, IGNORE stopWords check.
    const isTechMatch = techDictionary.hasOwnProperty(word);
    
    if (isTechMatch) {
       const match = techDictionary[word];
       extracted.set(match.name, match);
    } else {
       // Only block if NOT a tech dictionary match
       if (stopWords.has(word)) return;
    }
  };
  
  if (Array.isArray(terms)) {
    terms.forEach(term => addSkill(term));
  }

  // Explicit Phrase Matching for multi-word skills like "Amazon Web Services"
  Object.keys(techDictionary).forEach(key => {
    if (key.includes(' ')) {
       const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
       const matchRegex = new RegExp(`\\b${escaped}\\b`, 'gi');
       if (matchRegex.test(cleanText)) {
         addSkill(key);
       }
    }
  });

  const words = cleanText.split(/\s+/);
  words.forEach(addSkill);

  return Array.from(extracted.values());
}
