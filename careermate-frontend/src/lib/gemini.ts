import Groq from "groq-sdk";
import { ResumeData } from "@/types/resume";

const MODEL_ID = "llama-3.3-70b-versatile";

const getGroqClient = () => {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) return null;
    return new Groq({ apiKey, dangerouslyAllowBrowser: true });
};

export const generateCoverLetterAI = async (
  jobTitle: string, 
  company: string, 
  description: string, 
  tone: string,
  resumeData: ResumeData
): Promise<string> => {
  const groq = getGroqClient();
  if (!groq) {
    return "Groq API Key not configured. Please set NEXT_PUBLIC_GROQ_API_KEY in your .env.local file.";
  }

  const prompt = `Write a ${tone} cover letter for the position of ${jobTitle} at ${company}.
    
    Job Description:
    ${description}
    
    My Resume Details:
    Name: ${resumeData.personalInfo.fullName}
    Skills: ${resumeData.skills.join(', ')}
    Experience: ${resumeData.experience.map(e => e.jobTitle + " at " + e.company).join('; ')}
    
    Keep it professional and tailored to the job description. Do not include placeholders like [Your Name].`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL_ID,
    });
    return chatCompletion.choices[0]?.message?.content || "Failed to generate text.";
  } catch (error) {
    console.error("Groq API Error:", error);
    return "An error occurred while generating the cover letter.";
  }
};

export const generateColdEmailAI = async (
  recipientName: string,
  company: string,
  jobTitle: string,
  jobDescription: string,
  tone: string,
  resumeData: ResumeData
): Promise<string> => {
  const groq = getGroqClient();
  if (!groq) {
    return "Groq API Key not configured. Please set NEXT_PUBLIC_GROQ_API_KEY in your .env.local file.";
  }

  const prompt = `Write a ${tone} cold email to ${recipientName} at ${company} regarding the ${jobTitle} role.
    
    Job Context/Description:
    ${jobDescription}
    
    My Background:
    Name: ${resumeData.personalInfo.fullName}
    Key Skills: ${resumeData.skills.join(', ')}
    Summary: ${resumeData.personalInfo.summary}
    
    The email should be engaging, concise, and have a clear call to action.
    Format the output with a subject line at the top, followed by the body.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: MODEL_ID,
    });
    return chatCompletion.choices[0]?.message?.content || "Failed to generate text.";
  } catch (error) {
    console.error("Groq API Error:", error);
    return "An error occurred while generating the email.";
  }
};
