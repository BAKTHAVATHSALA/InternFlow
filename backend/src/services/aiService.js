require('dotenv').config();

const screenApplication = async (applicationData) => {
  const { 
    first_name, last_name, skills, college, degree, cgpa, 
    job_title, job_description 
  } = applicationData;

  const prompt = `
    Score this candidate for the position of "${job_title}".
    
    Job Description: ${job_description}
    
    Candidate Name: ${first_name} ${last_name}
    Degree: ${degree} from ${college} (CGPA: ${cgpa})
    Skills: ${skills.join(', ')}
    
    Provide a JSON response with:
    1. overall_score (0-100)
    2. skills_match (0-100)
    3. experience_fit (0-100)
    4. strengths (array of strings)
    5. gaps (array of strings)
    6. improvement_tips (array of strings)
    7. recommendation (strong_pass, pass, borderline, reject)
  `;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const content = data.content[0].text;
    
    // Extract JSON from response (simple regex or JSON.parse if clean)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Failed to parse AI response');
  } catch (err) {
    console.error('AI Screening Error:', err);
    return {
      overall_score: 50,
      recommendation: 'borderline',
      strengths: ['Manual review required'],
      gaps: ['AI service unavailable']
    };
  }
};

module.exports = { screenApplication };
