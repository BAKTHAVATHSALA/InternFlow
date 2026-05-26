require('dotenv').config();

// Tech keywords for skills matching against job description
const TECH_KEYWORDS = [
  'react','angular','vue','node','express','django','flask','spring','laravel',
  'javascript','typescript','python','java','golang','rust','c++','c#','php','ruby',
  'sql','postgresql','mysql','mongodb','redis','elasticsearch',
  'docker','kubernetes','aws','azure','gcp','terraform','jenkins','ci/cd',
  'html','css','tailwind','bootstrap','sass',
  'git','linux','bash','rest','graphql','grpc',
  'machine learning','deep learning','tensorflow','pytorch','pandas','numpy',
];

const clamp = (n, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(n)));

const ruleBasedScreening = (applicationData) => {
  const { skills = [], cgpa, degree, job_title = '', job_description = '' } = applicationData;

  const skillList = Array.isArray(skills) ? skills : [];
  const jobText = `${job_title} ${job_description}`.toLowerCase();

  // Skills match: count how many candidate skills appear in job text
  const matchedSkills = skillList.filter(s => jobText.includes(s.toLowerCase()));
  const unmatchedSkills = skillList.filter(s => !jobText.includes(s.toLowerCase()));

  // Extract keywords from job description that candidate lacks
  const missingKeywords = TECH_KEYWORDS.filter(kw =>
    jobText.includes(kw) && !skillList.some(s => s.toLowerCase().includes(kw))
  ).slice(0, 3);

  const skillsBase = skillList.length === 0 ? 40 : 50;
  const skillsBonus = skillList.length > 0
    ? (matchedSkills.length / Math.max(skillList.length, 1)) * 45
    : 0;
  const skillsCount = Math.min(skillList.length * 3, 5);
  const skills_match = clamp(skillsBase + skillsBonus + skillsCount);

  // Experience fit: based on CGPA / degree
  let experience_fit = 55;
  const cgpaNum = parseFloat(cgpa);
  if (!isNaN(cgpaNum)) {
    if (cgpaNum >= 9.0) experience_fit = 92;
    else if (cgpaNum >= 8.5) experience_fit = 85;
    else if (cgpaNum >= 8.0) experience_fit = 78;
    else if (cgpaNum >= 7.5) experience_fit = 70;
    else if (cgpaNum >= 7.0) experience_fit = 62;
    else if (cgpaNum >= 6.0) experience_fit = 54;
    else experience_fit = 44;
  } else if (cgpa) {
    // Percentage format
    const pct = parseFloat(cgpa);
    if (!isNaN(pct)) experience_fit = clamp(40 + pct * 0.5);
  }

  // Degree bonus
  const degreeText = (degree || '').toLowerCase();
  if (['b.tech', 'btech', 'b.e', 'be', 'mtech', 'm.tech'].some(d => degreeText.includes(d))) {
    experience_fit = clamp(experience_fit + 5);
  }

  const overall_score = clamp((skills_match * 0.55) + (experience_fit * 0.45));

  // Strengths
  const strengths = [];
  if (matchedSkills.length > 0) strengths.push(`Relevant skills: ${matchedSkills.slice(0, 3).join(', ')}`);
  if (!isNaN(cgpaNum) && cgpaNum >= 7.5) strengths.push(`Strong academic record (${cgpa})`);
  if (skillList.length >= 5) strengths.push('Broad technical skill set');
  if (strengths.length === 0) strengths.push('Internship candidate — further review recommended');

  // Gaps
  const gaps = [...missingKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1))];
  if (unmatchedSkills.length > 0 && missingKeywords.length === 0) {
    gaps.push('Skills not aligned with job requirements');
  }
  if (isNaN(cgpaNum) && !cgpa) gaps.push('Academic details incomplete');

  // Recommendation
  let recommendation;
  if (overall_score >= 80) recommendation = 'strong_pass';
  else if (overall_score >= 65) recommendation = 'pass';
  else if (overall_score >= 48) recommendation = 'borderline';
  else recommendation = 'reject';

  return {
    overall_score,
    skills_match,
    experience_fit,
    strengths,
    gaps: gaps.length ? gaps : ['No major gaps identified'],
    improvement_tips: missingKeywords.map(k => `Consider learning ${k.charAt(0).toUpperCase() + k.slice(1)}`),
    recommendation,
    _source: 'rule_based'
  };
};

const callGemini = async (prompt) => {
  const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-flash-lite-latest'];
  for (const model of models) {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1024 }
        })
      }
    );
    const data = await res.json();
    if (data.error?.code === 429) continue; // quota — try next model
    if (!res.ok) throw new Error(`Gemini ${model} error ${res.status}: ${data.error?.message}`);
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) return text;
  }
  throw new Error('All Gemini models quota exhausted');
};

const screenApplication = async (applicationData) => {
  const {
    first_name, last_name, skills, college, degree, cgpa,
    job_title, job_description
  } = applicationData;

  const skillsStr = Array.isArray(skills) && skills.length
    ? skills.join(', ')
    : 'Not specified';

  const prompt = `You are an HR screening assistant. Score this internship candidate strictly as JSON.

Position: "${job_title}"
Job Description: ${job_description || 'Not provided'}

Candidate:
- Name: ${first_name} ${last_name}
- Degree: ${degree || 'Not specified'} from ${college || 'Not specified'}
- CGPA: ${cgpa || 'Not specified'}
- Skills: ${skillsStr}

Respond ONLY with a JSON object (no markdown, no explanation):
{
  "overall_score": <0-100>,
  "skills_match": <0-100>,
  "experience_fit": <0-100>,
  "strengths": ["<string>", ...],
  "gaps": ["<string>", ...],
  "improvement_tips": ["<string>", ...],
  "recommendation": "<strong_pass|pass|borderline|reject>"
}`;

  try {
    const text = await callGemini(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON in Gemini response');

    const result = JSON.parse(jsonMatch[0]);
    result.overall_score  = clamp(Number(result.overall_score)  || 0);
    result.skills_match   = clamp(Number(result.skills_match)   || 0);
    result.experience_fit = clamp(Number(result.experience_fit) || 0);
    result.strengths      = Array.isArray(result.strengths)      ? result.strengths      : [];
    result.gaps           = Array.isArray(result.gaps)           ? result.gaps           : [];
    result.improvement_tips = Array.isArray(result.improvement_tips) ? result.improvement_tips : [];
    return result;
  } catch (err) {
    console.warn('[AI SCREENING] Gemini unavailable, using rule-based scoring:', err.message);
    return ruleBasedScreening(applicationData);
  }
};

module.exports = { screenApplication };
