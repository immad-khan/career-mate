"use client";

import React, { useState, useRef } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { FileText, CheckCircle, Loader2 } from 'lucide-react';
import { ResumeData } from '@/types/resume';

/* ── Inline resume template renderers (same as ResumePreview) ── */
const ClassicProfessional: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="p-8 font-serif text-gray-800">
    <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
      <h1 className="text-4xl font-bold uppercase tracking-wide">{data.personalInfo.fullName}</h1>
      <div className="mt-2 text-sm space-x-4">
        <span>{data.personalInfo.email}</span><span>|</span>
        <span>{data.personalInfo.phone}</span><span>|</span>
        <span>{data.personalInfo.location}</span>
      </div>
    </div>
    <div className="mb-6">
      <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3">Summary</h2>
      <p className="text-sm leading-relaxed">{data.personalInfo.summary}</p>
    </div>
    <div className="mb-6">
      <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3">Experience</h2>
      <div className="space-y-4">
        {data.experience.map(exp => (
          <div key={exp.id}>
            <div className="flex justify-between font-bold text-md"><span>{exp.jobTitle} - {exp.company}</span><span>{exp.startDate} - {exp.endDate}</span></div>
            <p className="text-sm mt-1">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
    <div className="mb-6">
      <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3">Education</h2>
      <div className="space-y-2">
        {data.education.map(edu => (
          <div key={edu.id}>
            <div className="flex justify-between font-bold text-md"><span>{edu.institution}</span><span>{edu.startDate} - {edu.endDate}</span></div>
            <div className="text-sm italic">{edu.degree}</div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <h2 className="text-xl font-bold uppercase border-b border-gray-400 mb-3">Skills</h2>
      <div className="text-sm">{data.skills.join(', ')}</div>
    </div>
  </div>
);

const ModernClean: React.FC<{ data: ResumeData }> = ({ data }) => (
  <div className="flex min-h-[800px] bg-white text-gray-800 font-sans">
    <div className="w-1/3 bg-emerald-50 p-6 border-r border-emerald-200">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900 leading-tight mb-2">{data.personalInfo.fullName}</h1>
        <p className="text-emerald-600 font-medium">{data.experience[0]?.jobTitle || 'Professional'}</p>
      </div>
      <div className="mb-6 text-sm space-y-2 text-gray-600">
        <p>{data.personalInfo.email}</p><p>{data.personalInfo.phone}</p><p>{data.personalInfo.location}</p>
      </div>
      <div className="mb-6">
        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Skills</h3>
        <div className="flex flex-wrap gap-2">
          {data.skills.map((skill, i) => <span key={i} className="bg-white px-2 py-1 rounded shadow-sm text-xs text-gray-700 border border-emerald-200">{skill}</span>)}
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-3">Education</h3>
        <div className="space-y-4">
          {data.education.map(edu => (
            <div key={edu.id} className="text-sm">
              <div className="font-bold">{edu.institution}</div>
              <div className="text-gray-600">{edu.degree}</div>
              <div className="text-xs text-gray-500 mt-1">{edu.startDate} - {edu.endDate}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="w-2/3 p-8">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-emerald-500 inline-block pb-1">Summary</h2>
        <p className="text-sm text-gray-600 leading-relaxed">{data.personalInfo.summary}</p>
      </div>
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b-2 border-emerald-500 inline-block pb-1">Experience</h2>
        <div className="space-y-6">
          {data.experience.map(exp => (
            <div key={exp.id}>
              <div className="mb-1"><span className="font-bold text-gray-800">{exp.jobTitle}</span><span className="mx-2 text-gray-400">|</span><span className="text-emerald-600 font-medium">{exp.company}</span></div>
              <div className="text-xs text-gray-400 mb-2">{exp.startDate} - {exp.endDate}</div>
              <p className="text-sm text-gray-600 leading-relaxed">{exp.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const getTemplateComponent = (id: string, data: ResumeData) => {
  switch (id) {
    case 'modern-clean': return <ModernClean data={data} />;
    default: return <ClassicProfessional data={data} />;
  }
};

const DownloadSection: React.FC = () => {
  const { setStep, resumeData, selectedTemplateId } = useResumeStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const hiddenRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const { jsPDF } = await import('jspdf');

      const element = hiddenRef.current;
      if (!element) {
        alert('Could not capture resume. Please try again.');
        setIsGenerating(false);
        return;
      }

      element.style.position = 'absolute';
      element.style.left = '0';
      element.style.top = '0';
      element.style.zIndex = '-1';
      element.style.visibility = 'visible';

      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: 794,
        windowWidth: 794,
        height: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdfWidth = 210;   // A4 mm
      const pdfHeight = 297;
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      let yOffset = 0;
      let remaining = imgHeight;
      while (remaining > 0) {
        pdf.addImage(imgData, 'JPEG', 0, -yOffset, imgWidth, imgHeight);
        remaining -= pdfHeight;
        if (remaining > 0) {
          pdf.addPage();
          yOffset += pdfHeight;
        }
      }

      const name = resumeData?.personalInfo?.fullName?.replace(/\s+/g, '_') || 'Resume';
      pdf.save(`${name}_Resume.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      {/* Hidden resume clone for html2canvas capture */}
      <div
        ref={hiddenRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '0',
          width: '794px',
          backgroundColor: '#fff',
          zIndex: -1,
        }}
      >
        {getTemplateComponent(selectedTemplateId, resumeData)}
      </div>

      <div className="text-center p-8 max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center">
            <div className="bg-green-500 p-2 rounded-lg">
              <span className="font-bold text-white text-xs">PDF</span>
            </div>
          </div>
        </div>

        <div className="inline-flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
          <CheckCircle size={14} className="mr-1" /> Successfully Generated
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Resume Is Ready!</h1>
        <p className="text-gray-500 mb-8">Download your PDF and start applying.</p>

        <div className="space-y-4">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <><Loader2 size={18} className="animate-spin" /> Generating PDF...</>
            ) : (
              <><FileText size={18} /> Download PDF</>
            )}
          </button>

          <button
            onClick={() => setStep('REVIEW')}
            className="block w-full text-green-600 font-medium hover:underline text-sm"
          >
            Edit Again
          </button>

          <div className="pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-400 mb-4">Done with your resume? Create a matching cover letter.</p>
            <button
              onClick={() => setStep('COVER_LETTER_INPUT')}
              className="w-full py-3 border border-green-500 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors"
            >
              Create Cover Letter
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-6">You can always come back to update your resume later.</p>
      </div>
    </div>
  );
};

export default DownloadSection;
