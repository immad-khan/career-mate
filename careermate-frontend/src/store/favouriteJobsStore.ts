import { create } from 'zustand';
import { jobCrawlerAPI } from '@/lib/api';

export interface FavouriteJob {
  job_id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  job_url: string;
  site: string;
  date_posted: string;
  job_type: string;
  is_remote: boolean;
}

interface FavouriteJobsStore {
  favouriteJobs: FavouriteJob[];
  favouriteIds: Set<string>;
  loaded: boolean;
  fetchFavourites: () => Promise<void>;
  addFavourite: (job: any) => void;
  removeFavourite: (jobId: string) => void;
}

export const useFavouriteJobsStore = create<FavouriteJobsStore>((set, get) => ({
  favouriteJobs: [],
  favouriteIds: new Set<string>(),
  loaded: false,

  fetchFavourites: async () => {
    try {
      const res = await jobCrawlerAPI.getSavedJobs();
      if (res.success && res.data) {
        set({
          favouriteJobs: res.data,
          favouriteIds: new Set(res.data.map((j: any) => j.job_id)),
          loaded: true,
        });
      }
    } catch {
      set({ loaded: true });
    }
  },

  addFavourite: (job: any) => {
    const { favouriteJobs, favouriteIds } = get();
    if (favouriteIds.has(job.id)) return;
    const newIds = new Set([...Array.from(favouriteIds), job.id]);
    const newJob: FavouriteJob = {
      job_id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      salary: job.salary,
      job_url: job.job_url,
      site: job.site,
      date_posted: job.date_posted,
      job_type: job.job_type,
      is_remote: job.is_remote,
    };
    set({ favouriteJobs: [...favouriteJobs, newJob], favouriteIds: newIds });
  },

  removeFavourite: (jobId: string) => {
    const { favouriteJobs, favouriteIds } = get();
    const newIds = new Set(favouriteIds);
    newIds.delete(jobId);
    set({
      favouriteJobs: favouriteJobs.filter(j => j.job_id !== jobId),
      favouriteIds: newIds,
    });
  },
}));
