"use client"

import { useState, useEffect } from "react"
import { FiSearch, FiMapPin, FiBriefcase, FiClock, FiDollarSign, FiExternalLink, FiHeart, FiCheck, FiArrowLeft, FiAlertCircle, FiChevronRight, FiFilter, FiTrendingUp, FiGlobe, FiUpload } from "react-icons/fi"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import { jobCrawlerAPI, jobsAPI } from "@/lib/api"
import { useFavouriteJobsStore } from "@/store/favouriteJobsStore"
import Button from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"

interface Job {
  id: string
  title: string
  company: string
  location: string
  job_url: string
  site: string
  date_posted: string
  salary: string
  description: string
  is_remote: boolean
  job_type: string
  is_local?: boolean
  local_uuid?: string
  required_skills?: string
  experience_level?: string
}

const FILTERS = [
  { id: 'today', label: 'Today' },
  { id: 'remote', label: 'Remote' },
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'internship', label: 'Internship' },
]

const SUGGESTED_SEARCHES = ["Software Engineer", "Data Analyst", "Web Developer", "Graphic Designer"]

export default function JobCrawler() {
  const [keyword, setKeyword] = useState("")
  const [loading, setLoading] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set())
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set())
  const [lastSearchTerm, setLastSearchTerm] = useState("")
  const [applicationJob, setApplicationJob] = useState<Job | null>(null)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false)
  const { addFavourite, removeFavourite, fetchFavourites } = useFavouriteJobsStore()

  // Load saved and applied jobs on mount
  useEffect(() => {
    fetchFavourites()
    const fetchUserData = async () => {
      try {
        const [savedRes, appliedRes] = await Promise.all([
          jobCrawlerAPI.getSavedJobs(),
          jobCrawlerAPI.getAppliedJobs()
        ])
        if (savedRes.success) {
          setSavedJobIds(new Set(savedRes.data.map((j: any) => j.job_id)))
        }
        if (appliedRes.success) {
          setAppliedJobIds(new Set(appliedRes.data.map((j: any) => j.job_id)))
        }
      } catch (error) {
        console.error("Failed to fetch user job data", error)
      }
    }
    fetchUserData()
  }, [])

  const handleSearch = async (e?: React.FormEvent, searchKeyword?: string) => {
    if (e) e.preventDefault()
    
    const term = (searchKeyword || keyword).trim()
    if (!term) {
      toast.error("Please enter a keyword to search")
      return
    }

    // Always clear current results when a new search starts
    setJobs([])
    setSelectedJob(null)
    setHasSearched(true)
    setLoading(true)

    // If search term changed, invalidate previous cache
    if (lastSearchTerm && lastSearchTerm !== term.toLowerCase()) {
      localStorage.removeItem(`careermate_job_search_${lastSearchTerm}`)
    }
    setLastSearchTerm(term.toLowerCase())

    const cacheKey = `careermate_job_search_${term.toLowerCase()}`

    // Check localStorage cache (24h TTL)
    const cachedRaw = localStorage.getItem(cacheKey)
    if (cachedRaw) {
      try {
        const { timestamp, data } = JSON.parse(cachedRaw)
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
        if (Date.now() - timestamp < TWENTY_FOUR_HOURS && Array.isArray(data) && data.length > 0) {
          setJobs(data)
          setLoading(false)
          // Still fetch fresh in background
        }
      } catch (_) {
        localStorage.removeItem(cacheKey)
      }
    }

    try {
      const response = await jobCrawlerAPI.searchJobs(term)
      if (response.success && response.data && response.data.length > 0) {
        setJobs(response.data)
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data: response.data
        }))
      } else {
        // Only blank out if cache didn't already load results
        setJobs(prev => prev.length > 0 ? prev : [])
        if (response.success && (!response.data || response.data.length === 0)) {
          if (!cachedRaw) toast.error("No jobs match your search. Try different keywords or filters")
        } else if (!response.success) {
          toast.error(response.message || "Failed to search jobs")
        }
      }
    } catch (error: any) {
      setJobs(prev => prev.length > 0 ? prev : [])
      if (!cachedRaw) toast.error("Error occurred while searching for jobs")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveJob = async (job: Job) => {
    try {
      if (savedJobIds.has(job.id)) {
        const res = await jobCrawlerAPI.unsaveJob(job.id)
        if (res.success) {
          const newSet = new Set(savedJobIds)
          newSet.delete(job.id)
          setSavedJobIds(newSet)
          removeFavourite(job.id)
          toast.success("Job removed from saved list")
        }
      } else {
        const res = await jobCrawlerAPI.saveJob(job)
        if (res.success) {
          setSavedJobIds(new Set([...Array.from(savedJobIds), job.id]))
          addFavourite(job)
          toast.success("Job saved successfully")
        }
      }
    } catch (error) {
      toast.error("Failed to update saved jobs")
    }
  }

  const handleApplyJob = async (job: Job) => {
    if (appliedJobIds.has(job.id)) return

    if (job.is_local && job.local_uuid) {
      setApplicationJob(job)
      setResumeFile(null)
      return
    }

    try {
      const res = await jobCrawlerAPI.applyJob(job)
      if (res.success) {
        setAppliedJobIds(new Set([...Array.from(appliedJobIds), job.id]))
        toast.success("Application submitted successfully to external job")
        window.open(job.job_url, '_blank')
      }
    } catch (error) {
      toast.error("Failed to submit application")
    }
  }

  const submitInternalApplication = async () => {
    if (!applicationJob?.local_uuid || !resumeFile) {
      toast.error('Please upload your resume before applying')
      return
    }

    const allowedExtensions = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg']
    const extension = resumeFile.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      toast.error('Upload your resume as a PDF, DOC, DOCX, PNG, or JPG file')
      return
    }
    if (resumeFile.size > 5 * 1024 * 1024) {
      toast.error('Your resume must be 5 MB or smaller')
      return
    }

    setIsSubmittingApplication(true)
    try {
      const formData = new FormData()
      formData.append('job', applicationJob.local_uuid)
      formData.append('resume', resumeFile)
      await jobsAPI.applyForJob(formData)
      setAppliedJobIds(new Set([...Array.from(appliedJobIds), applicationJob.id]))
      setApplicationJob(null)
      setResumeFile(null)
      toast.success('Application submitted. The employer can now review your profile and resume.')
    } catch (error) {
      toast.error('Failed to submit application')
    } finally {
      setIsSubmittingApplication(false)
    }
  }

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(f => f !== filterId) 
        : [...prev, filterId]
    )
  }

  const filteredJobs = jobs.filter(job => {
    if (activeFilters.length === 0) return true
    
    return activeFilters.every(filter => {
      if (filter === 'remote') return job.is_remote
      if (filter === 'today') {
         // Mock filter for 'today' since date parsing might be complex
         return job.date_posted.includes('today') || job.date_posted.includes('hour')
      }
      if (filter === 'full-time') return job.job_type?.toLowerCase().includes('full')
      if (filter === 'part-time') return job.job_type?.toLowerCase().includes('part')
      if (filter === 'internship') return job.job_type?.toLowerCase().includes('intern')
      return true
    })
  })

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <AnimatePresence mode="wait">
        {!selectedJob ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-10"
          >
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                Find the Latest Job Openings
              </h1>
              <div className="max-w-2xl mx-auto pt-4">
                <form onSubmit={handleSearch} className="relative group">
                  <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                    <FiSearch className="h-6 w-6 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Search job title or field..."
                    className="block w-full pl-16 pr-32 py-5 bg-white border-2 border-slate-100 rounded-2xl text-lg font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-sm"
                  />
                  <div className="absolute inset-y-2 right-2 flex items-center">
                    <Button
                      type="submit"
                      isLoading={loading}
                      className="h-full px-8 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold"
                    >
                      Search
                    </Button>
                  </div>
                </form>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mr-2 flex items-center gap-2">
                    <FiFilter /> Filters:
                  </span>
                  {FILTERS.map(filter => (
                    <button
                      key={filter.id}
                      onClick={() => toggleFilter(filter.id)}
                      className={`px-5 py-2.5 rounded-full text-xs font-bold border-2 transition-all ${
                        activeFilters.includes(filter.id)
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-white border-slate-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600"
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900">Latest Job Results</h2>
                <p className="text-xs font-bold text-slate-400">
                  {loading ? "Searching..." : `Showing ${filteredJobs.length} results`}
                </p>
              </div>

              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Spinner size="lg" className="text-emerald-500" />
                  <p className="text-sm font-bold text-slate-500 animate-pulse">Scanning the web for opportunities...</p>
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredJobs.map((job) => (
                    <motion.div
                      layout
                      key={job.id}
                      className="group bg-white border border-slate-100 rounded-3xl p-6 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer"
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 font-black text-2xl shrink-0 group-hover:bg-emerald-100 transition-colors">
                          {job.company?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">{job.title}</h3>
                              <p className="text-sm font-bold text-slate-500 flex items-center gap-1.5 mt-1">
                                {job.company} <span className="text-slate-200">•</span> {job.location} <span className="text-slate-200">•</span> {job.salary}
                              </p>
                            </div>
                            <div className="flex gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); handleSaveJob(job); }}
                                    className={`p-3 rounded-xl border transition-all ${savedJobIds.has(job.id) ? 'bg-rose-50 border-rose-100 text-rose-500' : 'bg-white border-slate-100 text-slate-400 hover:border-rose-100 hover:text-rose-500'}`}
                                >
                                    <FiHeart className={savedJobIds.has(job.id) ? 'fill-current' : ''} />
                                </button>
                                <Button
                                    onClick={(e) => { e.stopPropagation(); handleApplyJob(job); }}
                                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider ${appliedJobIds.has(job.id) ? 'bg-slate-100 !text-slate-500' : 'bg-emerald-500 text-white'}`}
                                >
                                    {appliedJobIds.has(job.id) ? 'Applied' : 'Apply'}
                                </Button>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 pt-2">
                            {job.is_remote && (
                                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100">Remote</span>
                            )}
                            <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase rounded-lg border border-slate-100">{job.job_type}</span>
                            <span className="px-3 py-1 bg-white text-slate-400 text-[10px] font-bold uppercase rounded-lg border border-slate-100">Source: {job.site}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="py-20 text-center space-y-8 bg-slate-50/50 rounded-[40px] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-500">
                    <FiAlertCircle className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">No Job Listings Found</h3>
                    <p className="text-slate-500 font-medium">Try searching different keywords or adjusting filters.</p>
                  </div>
                  
                  <div className="max-w-md mx-auto">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Suggested searches</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {SUGGESTED_SEARCHES.map(s => (
                            <button 
                                key={s} 
                                onClick={() => { setKeyword(s); handleSearch(undefined, s); }}
                                className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:border-emerald-500 hover:text-emerald-600 transition-all"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                  </div>

                  <Button 
                    variant="outline"
                    onClick={() => { setHasSearched(false); setKeyword(""); setJobs([]); }}
                    className="px-8 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100"
                  >
                    Back to Job Search
                  </Button>
                </div>
              ) : (
                <div className="py-32 text-center space-y-6">
                    <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500 animate-pulse">
                        <FiBriefcase className="w-10 h-10" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900">Your dream job is waiting</h3>
                        <p className="text-slate-500 font-medium max-w-sm mx-auto mt-2">Enter a job title or skill above to scan the latest openings from LinkedIn, Indeed, and more.</p>
                    </div>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="details"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10"
          >
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-10">
              <button 
                onClick={() => setSelectedJob(null)}
                className="flex items-center gap-2 text-sm font-black text-slate-400 hover:text-emerald-500 transition-all"
              >
                <FiArrowLeft /> Back to results
              </button>

              <div className="space-y-8">
                <div className="space-y-4">
                    <h2 className="text-xs font-black text-emerald-500 uppercase tracking-widest">Job Details</h2>
                    <h1 className="text-5xl font-black text-slate-900 leading-tight">{selectedJob.title}</h1>
                    <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-slate-500 font-bold">
                        <span className="flex items-center gap-2"><FiBriefcase /> {selectedJob.company}</span>
                        <span className="flex items-center gap-2"><FiMapPin /> {selectedJob.location}</span>
                        <span className="flex items-center gap-2"><FiGlobe /> Fetched from {selectedJob.site}</span>
                    </div>
                    <div className="text-3xl font-black text-emerald-600 pt-2">
                        {selectedJob.salary}
                    </div>
                </div>

                {selectedJob.required_skills && (
                    <div className="flex flex-wrap gap-2">
                        {selectedJob.required_skills.split(',').map((tag: string) => tag.trim()).filter(Boolean).map((tag: string) => (
                            <span key={tag} className="px-4 py-2 bg-emerald-50 text-emerald-600 text-xs font-black uppercase rounded-xl border border-emerald-100">
                                {tag}
                            </span>
                        ))}
                    </div>
                )}

                <div className="prose prose-slate max-w-none">
                    <h3 className="text-xl font-black text-slate-900 mb-4">Job Description</h3>
                    <div className="text-slate-600 leading-relaxed space-y-4">
                        {selectedJob.description ? (
                            selectedJob.description.split('\n').filter((p: string) => p.trim()).map((paragraph: string, idx: number) => (
                                <p key={idx}>{paragraph.trim()}</p>
                            ))
                        ) : (
                            <p className="text-slate-400 italic">No description provided for this job.</p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-8 py-8 border-y border-slate-100">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Job Type</p>
                        <p className="text-lg font-black text-slate-900">{selectedJob.job_type || 'Not specified'}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Published Date</p>
                        <p className="text-lg font-black text-slate-900">{selectedJob.date_posted || 'Not available'}</p>
                    </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <div className="bg-white border-2 border-slate-50 rounded-[40px] p-8 shadow-2xl shadow-slate-200/50 sticky top-8">
                    <div className="flex flex-col items-center text-center space-y-6">
                        <div className="w-24 h-24 bg-slate-900 rounded-[32px] flex items-center justify-center text-white text-4xl font-black">
                            {selectedJob.company?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900">{selectedJob.company}</h3>
                            {selectedJob.experience_level && (
                                <p className="text-xs font-bold text-slate-400 mt-1">{selectedJob.experience_level}</p>
                            )}
                        </div>

                        <div className="w-full space-y-4 pt-6">
                            <Button 
                                onClick={() => handleApplyJob(selectedJob)}
                                className="w-full h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-lg shadow-xl shadow-emerald-500/20"
                            >
                                {appliedJobIds.has(selectedJob.id) ? 'Application Sent' : 'Apply Now'}
                            </Button>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <button 
                                    onClick={() => handleSaveJob(selectedJob)}
                                    className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-all p-3 rounded-xl border border-slate-100"
                                >
                                    <FiHeart className={savedJobIds.has(selectedJob.id) ? 'text-rose-500 fill-current' : ''} />
                                    {savedJobIds.has(selectedJob.id) ? 'Job Saved' : 'Save Job'}
                                </button>
                                <a 
                                    href={selectedJob.job_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-emerald-600 transition-all p-3 rounded-xl border border-slate-100"
                                >
                                    <FiExternalLink /> Visit Original Listing
                                </a>
                            </div>
                        </div>

                        <div className="pt-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {selectedJob.date_posted ? `Posted on: ${selectedJob.date_posted}` : 'Date not available'}
                        </div>
                    </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {applicationJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close application dialog"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => !isSubmittingApplication && setApplicationJob(null)}
          />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl">
            <h3 className="text-2xl font-black text-slate-900">Apply for {applicationJob.title}</h3>
            <p className="mt-2 text-sm text-slate-500">
              Upload your résumé to apply. It will be securely stored in Cloudinary and shared with this job&apos;s HR team together with your profile details.
            </p>

            <label className="mt-6 flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/50 px-5 py-8 text-center hover:bg-emerald-50">
              <FiUpload className="h-7 w-7 text-emerald-600" />
              <span className="text-sm font-bold text-slate-700">
                {resumeFile ? resumeFile.name : 'Choose résumé file'}
              </span>
              <span className="text-xs text-slate-500">PDF, DOC, DOCX, PNG, or JPG — maximum 5 MB</span>
              <input
                type="file"
                className="sr-only"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/png,image/jpeg"
                onChange={(event) => setResumeFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setApplicationJob(null)} disabled={isSubmittingApplication}>
                Cancel
              </Button>
              <Button onClick={submitInternalApplication} isLoading={isSubmittingApplication} className="bg-emerald-500 text-white hover:bg-emerald-600">
                Submit Application
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
