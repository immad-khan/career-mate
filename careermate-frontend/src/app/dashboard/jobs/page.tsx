import JobCrawler from "@/components/job-crawler/JobCrawler"

export const metadata = {
  title: "Job Crawler | CareerMate",
  description: "Find the latest job openings tailored to your skills.",
}

export default function JobCrawlerPage() {
  return (
    <div className="min-h-screen bg-slate-50/30">
      <JobCrawler />
    </div>
  )
}
