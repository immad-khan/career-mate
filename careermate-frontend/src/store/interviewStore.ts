import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type InterviewStep = 'START' | 'QUIZ' | 'PAUSED' | 'RESULT';
export type TestType = 'WRITTEN' | 'MCQ';

interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
  options?: string[];
  correctAnswer?: string;
}

interface InterviewResult {
  score: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  detailedBreakdown: {
    question: string;
    feedback: string;
    rating: number;
    correctAnswer: string;
    explanation: string;
  }[];
}

interface InterviewState {
  step: InterviewStep;
  difficulty: string;
  category: string;
  testType: TestType;
  questions: InterviewQuestion[];
  answers: string[];
  currentIndex: number;
  result: InterviewResult | null;
  timeStarted: number | null;
  timeEnded: number | null;

  // Actions
  setStep: (step: InterviewStep) => void;
  startInterview: (category: string, difficulty: string, testType: TestType, questions: InterviewQuestion[]) => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishInterview: (result: InterviewResult) => void;
  resetInterview: () => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      step: 'START',
      difficulty: '',
      category: '',
      testType: 'WRITTEN',
      questions: [],
      answers: [],
      currentIndex: 0,
      result: null,
      timeStarted: null,
      timeEnded: null,

      setStep: (step) => set({ step }),

      startInterview: (category, difficulty, testType, questions) => set({
        category,
        difficulty,
        testType,
        questions,
        answers: [],
        currentIndex: 0,
        step: 'QUIZ',
        timeStarted: Date.now(),
        result: null
      }),

      submitAnswer: (answer) => set((state) => {
        const newAnswers = [...state.answers];
        newAnswers[state.currentIndex] = answer;
        return { answers: newAnswers };
      }),

      nextQuestion: () => set((state) => ({
        currentIndex: Math.min(state.currentIndex + 1, state.questions.length - 1)
      })),

      prevQuestion: () => set((state) => ({
        currentIndex: Math.max(state.currentIndex - 1, 0)
      })),

      finishInterview: (result) => set({
        result,
        step: 'RESULT',
        timeEnded: Date.now()
      }),

      resetInterview: () => set({
        step: 'START',
        questions: [],
        answers: [],
        currentIndex: 0,
        result: null,
        timeStarted: null,
        timeEnded: null
      })
    }),
    {
      name: 'interview-storage'
    }
  )
);
