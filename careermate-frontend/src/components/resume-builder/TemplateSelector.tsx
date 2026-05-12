"use client";

import React, { useState, useMemo } from 'react';
import { useResumeStore } from '@/store/resumeStore';
import { Check } from 'lucide-react';

const templates = [
  { id: 'classic-professional', name: 'Classic Professional', industry: 'Finance', layout: 'Single-column', color: 'Neutral' },
  { id: 'modern-clean', name: 'Modern Clean', industry: 'Technology', layout: 'Two-column', color: 'Green accents' },
  { id: 'compact-timeline', name: 'Compact Timeline', industry: 'Creative', layout: 'Timeline', color: 'Bold' },
  { id: 'creative-header', name: 'Creative Header', industry: 'Creative', layout: 'Two-column', color: 'Bold' },
  { id: 'executive-focus', name: 'Executive Focus', industry: 'Finance', layout: 'Single-column', color: 'Neutral' },
  { id: 'minimal-one-page', name: 'Minimal One-Page', industry: 'Technology', layout: 'Single-column', color: 'Neutral' },
];

const allIndustries = ['Technology', 'Finance', 'Creative', 'Healthcare'];
const allLayouts = ['Two-column', 'Single-column', 'Timeline'];
const allColors = ['Green accents', 'Neutral', 'Bold'];

/* ── Mini preview thumbnails for each template ── */
const TemplateThumbnail: React.FC<{ id: string }> = ({ id }) => {
  switch (id) {
    case 'classic-professional':
      return (
        <div className="w-full h-full bg-white p-3 flex flex-col text-[5px] font-serif">
          <div className="text-center border-b-2 border-gray-800 pb-2 mb-2">
            <div className="h-3 w-20 mx-auto bg-gray-800 rounded-sm mb-1"></div>
            <div className="flex justify-center gap-1">
              <div className="h-1.5 w-10 bg-gray-400 rounded-sm"></div>
              <div className="h-1.5 w-8 bg-gray-400 rounded-sm"></div>
            </div>
          </div>
          <div className="space-y-2 flex-1">
            <div><div className="h-2 w-14 bg-gray-700 mb-1 rounded-sm"></div><div className="space-y-0.5"><div className="h-1 w-full bg-gray-200 rounded-sm"></div><div className="h-1 w-3/4 bg-gray-200 rounded-sm"></div></div></div>
            <div><div className="h-2 w-16 bg-gray-700 mb-1 rounded-sm"></div><div className="space-y-0.5"><div className="h-1 w-full bg-gray-200 rounded-sm"></div><div className="h-1 w-5/6 bg-gray-200 rounded-sm"></div></div></div>
          </div>
        </div>
      );
    case 'modern-clean':
      return (
        <div className="w-full h-full bg-white flex text-[5px]">
          <div className="w-2/5 bg-emerald-50 p-2 border-r border-emerald-200">
            <div className="h-3 w-12 bg-emerald-700 rounded-sm mb-2"></div>
            <div className="h-1.5 w-10 bg-emerald-400 rounded-sm mb-2"></div>
            <div className="space-y-1 mb-2"><div className="h-1 w-9 bg-emerald-200 rounded-sm"></div><div className="h-1 w-7 bg-emerald-200 rounded-sm"></div></div>
            <div className="flex flex-wrap gap-0.5">{[1,2,3,4].map(i=><div key={i} className="h-2 w-5 bg-white border border-emerald-300 rounded-sm"></div>)}</div>
          </div>
          <div className="w-3/5 p-2">
            <div className="h-2 w-10 bg-gray-800 mb-0.5 rounded-sm"></div><div className="h-0.5 w-8 bg-emerald-500 mb-2"></div>
            <div className="space-y-0.5 mb-2"><div className="h-1 w-full bg-gray-200 rounded-sm"></div><div className="h-1 w-4/5 bg-gray-200 rounded-sm"></div></div>
            <div className="h-2 w-12 bg-gray-800 mb-0.5 rounded-sm"></div><div className="h-0.5 w-8 bg-emerald-500 mb-2"></div>
            <div className="space-y-0.5"><div className="h-1 w-full bg-gray-200 rounded-sm"></div><div className="h-1 w-3/4 bg-gray-200 rounded-sm"></div></div>
          </div>
        </div>
      );
    case 'compact-timeline':
      return (
        <div className="w-full h-full bg-white p-3 text-[5px]">
          <div className="text-center mb-2">
            <div className="h-3 w-16 mx-auto bg-indigo-700 rounded-sm mb-1"></div>
            <div className="h-1.5 w-20 mx-auto bg-indigo-300 rounded-sm"></div>
          </div>
          <div className="border-l-2 border-indigo-400 pl-2 ml-2 space-y-2">
            {[1,2,3].map(i=>(
              <div key={i} className="relative">
                <div className="absolute -left-[11px] top-0 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white"></div>
                <div className="h-1.5 w-12 bg-indigo-600 rounded-sm mb-0.5"></div>
                <div className="h-1 w-full bg-gray-200 rounded-sm"></div>
              </div>
            ))}
          </div>
        </div>
      );
    case 'creative-header':
      return (
        <div className="w-full h-full bg-white text-[5px]">
          <div className="bg-gradient-to-r from-rose-500 to-orange-400 p-3 text-white">
            <div className="h-3 w-16 bg-white/30 rounded-sm mb-1"></div>
            <div className="h-1.5 w-12 bg-white/20 rounded-sm"></div>
          </div>
          <div className="flex p-2">
            <div className="w-1/2 pr-2 border-r border-gray-200">
              <div className="h-2 w-10 bg-rose-500 rounded-sm mb-1"></div>
              <div className="space-y-0.5"><div className="h-1 w-full bg-gray-200 rounded-sm"></div><div className="h-1 w-3/4 bg-gray-200 rounded-sm"></div></div>
            </div>
            <div className="w-1/2 pl-2">
              <div className="h-2 w-10 bg-rose-500 rounded-sm mb-1"></div>
              <div className="flex flex-wrap gap-0.5">{[1,2,3].map(i=><div key={i} className="h-2 w-5 bg-rose-100 rounded-sm"></div>)}</div>
            </div>
          </div>
        </div>
      );
    case 'executive-focus':
      return (
        <div className="w-full h-full bg-white text-[5px]">
          <div className="bg-slate-800 p-3">
            <div className="h-3 w-16 bg-amber-400 rounded-sm mb-1"></div>
            <div className="h-1.5 w-20 bg-slate-400 rounded-sm"></div>
          </div>
          <div className="p-2 space-y-2">
            <div><div className="h-2 w-14 bg-slate-700 mb-1 rounded-sm border-b-2 border-amber-400"></div><div className="space-y-0.5"><div className="h-1 w-full bg-gray-200 rounded-sm"></div><div className="h-1 w-4/5 bg-gray-200 rounded-sm"></div></div></div>
            <div><div className="h-2 w-14 bg-slate-700 mb-1 rounded-sm border-b-2 border-amber-400"></div><div className="space-y-0.5"><div className="h-1 w-full bg-gray-200 rounded-sm"></div><div className="h-1 w-3/4 bg-gray-200 rounded-sm"></div></div></div>
          </div>
        </div>
      );
    case 'minimal-one-page':
      return (
        <div className="w-full h-full bg-white p-3 text-[5px]">
          <div className="mb-2">
            <div className="h-3 w-14 bg-gray-900 rounded-sm mb-0.5"></div>
            <div className="h-1 w-20 bg-gray-300 rounded-sm"></div>
          </div>
          <div className="h-px bg-gray-300 my-1.5"></div>
          <div className="space-y-2">
            <div><div className="h-1.5 w-10 bg-gray-600 rounded-sm mb-0.5 uppercase"></div><div className="h-1 w-full bg-gray-100 rounded-sm"></div></div>
            <div><div className="h-1.5 w-12 bg-gray-600 rounded-sm mb-0.5 uppercase"></div><div className="h-1 w-full bg-gray-100 rounded-sm"></div><div className="h-1 w-3/4 bg-gray-100 rounded-sm mt-0.5"></div></div>
            <div><div className="h-1.5 w-8 bg-gray-600 rounded-sm mb-0.5 uppercase"></div><div className="flex flex-wrap gap-0.5">{[1,2,3,4,5].map(i=><div key={i} className="h-1.5 w-5 bg-gray-200 rounded-sm"></div>)}</div></div>
          </div>
        </div>
      );
    default:
      return <div className="w-full h-full bg-gray-100"></div>;
  }
};

const TemplateSelector: React.FC = () => {
  const { setStep, selectedTemplateId, setSelectedTemplateId } = useResumeStore();

  const [activeIndustries, setActiveIndustries] = useState<Set<string>>(new Set(allIndustries));
  const [activeLayouts, setActiveLayouts] = useState<Set<string>>(new Set(allLayouts));
  const [activeColors, setActiveColors] = useState<Set<string>>(new Set(allColors));

  const toggleFilter = (set: Set<string>, setter: React.Dispatch<React.SetStateAction<Set<string>>>, value: string) => {
    setter(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const filteredTemplates = useMemo(() =>
    templates.filter(t =>
      activeIndustries.has(t.industry) &&
      activeLayouts.has(t.layout) &&
      activeColors.has(t.color)
    ), [activeIndustries, activeLayouts, activeColors]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Resume Template</h1>
        <p className="text-gray-500 mt-1">Pick a layout that suits your profession</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Templates Grid */}
        <div className="flex-1">
          {filteredTemplates.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">No templates match your filters</p>
              <p className="text-sm mt-1">Try adjusting the filter options</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div 
                key={template.id}
                className={`group cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg ${selectedTemplateId === template.id ? 'border-green-500 ring-2 ring-green-200 shadow-lg' : 'border-gray-200 hover:border-green-300'}`}
                onClick={() => setSelectedTemplateId(template.id)}
              >
                <div className="bg-gray-50 h-64 flex items-center justify-center relative p-4">
                   <div className="w-full h-full shadow-md rounded overflow-hidden">
                     <TemplateThumbnail id={template.id} />
                   </div>
                   {selectedTemplateId === template.id && (
                     <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full shadow">
                       <Check size={16} />
                     </div>
                   )}
                </div>
                <div className="p-4 bg-white border-t border-gray-100">
                  <h3 className="font-semibold text-gray-900 text-center">{template.name}</h3>
                  <div className="flex justify-center gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">{template.layout}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200">{template.industry}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <button 
              onClick={() => setStep('PREVIEW')}
              disabled={!selectedTemplateId}
              className="px-10 py-3 bg-green-500 text-white font-semibold rounded-lg shadow hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Use This Template
            </button>
          </div>
        </div>

        {/* Filters Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl border border-green-100 sticky top-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">Filters</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Industry</h4>
              <div className="space-y-2">
                {allIndustries.map(f => (
                  <label key={f} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeIndustries.has(f)}
                      onChange={() => toggleFilter(activeIndustries, setActiveIndustries, f)}
                      className="rounded text-green-500 focus:ring-green-500 accent-green-600"
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Layout style</h4>
              <div className="space-y-2">
                {allLayouts.map(f => (
                  <label key={f} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeLayouts.has(f)}
                      onChange={() => toggleFilter(activeLayouts, setActiveLayouts, f)}
                      className="rounded text-green-500 focus:ring-green-500 accent-green-600"
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Color scheme</h4>
              <div className="space-y-2">
                {allColors.map(f => (
                  <label key={f} className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeColors.has(f)}
                      onChange={() => toggleFilter(activeColors, setActiveColors, f)}
                      className="rounded text-green-500 focus:ring-green-500 accent-green-600"
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
