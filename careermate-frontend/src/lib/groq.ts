import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Required for client-side usage, though server-side is preferred
});

export const generateInterviewQuestions = async (category: string, difficulty: string, testType: string = 'WRITTEN') => {
  const isMCQ = testType === 'MCQ';
  const prompt = `Generate 10 interview questions for a ${category} interview at the ${difficulty} level. 
  The test type is ${testType}.
  ${isMCQ ? 'For each question, provide 4 multiple-choice options (A, B, C, D) and specify the correct answer.' : 'Questions should be open-ended for written answers.'}
  Return the result as a JSON array of objects.
  Each object must have:
  - "id" (number)
  - "question" (string)
  - "category" (string)
  ${isMCQ ? '- "options" (array of strings, exactly 4)\n  - "correctAnswer" (string, the text of the correct option)' : ''}
  Do not include any other text in the response, just the JSON array.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) return [];
    
    const parsed = JSON.parse(content);
    const questions = parsed.questions || parsed;
    return Array.isArray(questions) ? questions : [];
  } catch (error) {
    console.error("Error generating questions:", error);
    return [];
  }
};

export const evaluateAnswers = async (questions: any[], answers: any[]) => {
  const data = questions.map((q, idx) => ({
    question: q.question,
    answer: answers[idx] || "No answer provided"
  }));

  const prompt = `Evaluate the following interview answers:
  ${JSON.stringify(data)}
  
  Return a JSON object with:
  - "score": percentage (number, e.g. 85)
  - "summary": a brief overall summary (string)
  - "strengths": array of strings
  - "improvements": array of strings
  - "detailedBreakdown": array of objects, each containing:
    - "question": the original question
    - "feedback": constructive feedback on the user's answer
    - "rating": rating for this specific answer (1-10)
    - "correctAnswer": what a perfect/ideal answer would look like (STAR framework)
    - "explanation": explanation of why that answer is ideal and key points to hit
  
  Do not include any other text. Avoid using markdown formatting inside the JSON strings.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    });

    return JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("Error evaluating answers:", error);
    return null;
  }
};
