export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  linkedin?: string;
  website?: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  startDate: string;
  endDate: string;
  details?: string;
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: string[];
}

export interface Template {
  id: string;
  name: string;
  thumbnail: string;
  tags: {
    industry: string[];
    layout: string;
    color: string;
  };
}

export type ResumeStep = 
  | 'INFO' 
  | 'TEMPLATE' 
  | 'PREVIEW' 
  | 'SUCCESS' 
  | 'REVIEW' 
  | 'COVER_LETTER_INPUT' 
  | 'COVER_LETTER_PREVIEW' 
  | 'COLD_EMAIL_INPUT' 
  | 'COLD_EMAIL_PREVIEW';

export interface CoverLetterData {
  jobTitle: string;
  company: string;
  description: string;
  tone: 'Professional' | 'Persuasive' | 'Concise';
  generatedContent: string;
}

export interface ColdEmailData {
  recipientName: string;
  company: string;
  jobTitle: string;
  jobDescription: string;
  tone: 'Formal' | 'Persuasive' | 'Concise';
  generatedContent: string;
}
