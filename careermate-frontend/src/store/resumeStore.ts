import { create } from 'zustand';
import { ResumeData, ResumeStep, CoverLetterData, ColdEmailData } from '@/types/resume';

interface ResumeStore {
  currentStep: ResumeStep;
  setStep: (step: ResumeStep) => void;
  
  resumeData: ResumeData;
  setResumeData: (data: Partial<ResumeData>) => void;
  updatePersonalInfo: (info: Partial<ResumeData['personalInfo']>) => void;
  addEducation: () => void;
  updateEducation: (id: string, data: Partial<ResumeData['education'][0]>) => void;
  removeEducation: (id: string) => void;
  addExperience: () => void;
  updateExperience: (id: string, data: Partial<ResumeData['experience'][0]>) => void;
  removeExperience: (id: string) => void;
  setSkills: (skills: string[]) => void;

  selectedTemplateId: string;
  setSelectedTemplateId: (id: string) => void;

  coverLetter: CoverLetterData;
  setCoverLetter: (data: Partial<CoverLetterData>) => void;

  coldEmail: ColdEmailData;
  setColdEmail: (data: Partial<ColdEmailData>) => void;
}

const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
  },
  education: [{
    id: '1',
    institution: '',
    degree: '',
    startDate: '',
    endDate: '',
    details: ''
  }],
  experience: [{
    id: '1',
    jobTitle: '',
    company: '',
    startDate: '',
    endDate: '',
    description: ''
  }],
  skills: [],
};

export const useResumeStore = create<ResumeStore>((set) => ({
  currentStep: 'INFO',
  setStep: (step) => set({ currentStep: step }),

  resumeData: initialResumeData,
  setResumeData: (data) => set((state) => ({ resumeData: { ...state.resumeData, ...data } })),
  
  updatePersonalInfo: (info) => set((state) => ({
    resumeData: { ...state.resumeData, personalInfo: { ...state.resumeData.personalInfo, ...info } }
  })),

  addEducation: () => set((state) => ({
    resumeData: {
      ...state.resumeData,
      education: [...state.resumeData.education, { 
        id: Math.random().toString(36).substr(2, 9), 
        institution: '', 
        degree: '', 
        startDate: '', 
        endDate: '' 
      }]
    }
  })),
  updateEducation: (id, data) => set((state) => ({
    resumeData: {
      ...state.resumeData,
      education: state.resumeData.education.map(edu => edu.id === id ? { ...edu, ...data } : edu)
    }
  })),
  removeEducation: (id) => set((state) => ({
    resumeData: {
      ...state.resumeData,
      education: state.resumeData.education.filter(edu => edu.id !== id)
    }
  })),

  addExperience: () => set((state) => ({
    resumeData: {
      ...state.resumeData,
      experience: [...state.resumeData.experience, {
        id: Math.random().toString(36).substr(2, 9),
        jobTitle: '',
        company: '',
        startDate: '',
        endDate: '',
        description: ''
      }]
    }
  })),
  updateExperience: (id, data) => set((state) => ({
    resumeData: {
      ...state.resumeData,
      experience: state.resumeData.experience.map(exp => exp.id === id ? { ...exp, ...data } : exp)
    }
  })),
  removeExperience: (id) => set((state) => ({
    resumeData: {
      ...state.resumeData,
      experience: state.resumeData.experience.filter(exp => exp.id !== id)
    }
  })),

  setSkills: (skills) => set((state) => ({
    resumeData: { ...state.resumeData, skills }
  })),

  selectedTemplateId: 'modern-clean',
  setSelectedTemplateId: (id) => set({ selectedTemplateId: id }),

  coverLetter: {
    jobTitle: '',
    company: '',
    description: '',
    tone: 'Professional',
    generatedContent: ''
  },
  setCoverLetter: (data) => set((state) => ({ coverLetter: { ...state.coverLetter, ...data } })),

  coldEmail: {
    recipientName: '',
    company: '',
    jobTitle: '',
    jobDescription: '',
    tone: 'Formal',
    generatedContent: ''
  },
  setColdEmail: (data) => set((state) => ({ coldEmail: { ...state.coldEmail, ...data } })),
}));
