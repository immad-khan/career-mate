import { BaseCrawler } from './BaseCrawler.js';

export class BrightspyreCrawler extends BaseCrawler {
    constructor(options = {}) {
        super('Brightspyre', options);
        this.baseUrl = 'https://resume.brightspyre.com';
    }

    buildSearchUrl(searchParams) {
        const {
            keyword = '',
            page = 1
        } = searchParams;

        // Brightspyre search: /jobs?query=keyword
        let url = `${this.baseUrl}/jobs?query=${encodeURIComponent(keyword)}`;
        if (page > 1) {
            url += `&page=${page}`;
        }
        return url;
    }

    async extractJobData() {
        try {
            await this.page.waitForSelector('.job-listing, .item', { timeout: 15000 }).catch(e => this.logger.warn("Selector wait timeout on Brightspyre"));
            
            const jobs = await this.page.evaluate(() => {
                const extractedJobs = [];
                const jobCards = document.querySelectorAll('.job-listing, .item, div[class*="job"]');
                
                jobCards.forEach((card) => {
                    try {
                        const titleEl = card.querySelector('h3, h4, .job-title');
                        const linkEl = titleEl ? titleEl.querySelector('a') : card.querySelector('a');
                        
                        if (!titleEl || !linkEl) return;

                        const title = titleEl.textContent?.trim() || '';
                        const jobUrl = linkEl.href || '';
                        
                        const companyEl = card.querySelector('.employer, .company');
                        const company = companyEl ? companyEl.textContent?.trim() : 'See listing';
                        
                        const locationEl = card.querySelector('.location, .job-location');
                        const location = locationEl ? locationEl.textContent?.trim() : 'Pakistan';

                        if (title.length > 2 && jobUrl.includes('/jobs/')) {
                            extractedJobs.push({
                                title,
                                company,
                                location,
                                salary: 'Not specified',
                                description: title,
                                url: jobUrl,
                                datePosted: ''
                            });
                        }
                    } catch (error) {
                        console.error('Error extracting job from Brightspyre:', error);
                    }
                });

                return extractedJobs;
            });

            this.logger.info(`Brightspyre extraction found ${jobs.length} jobs`);
            return jobs.map(job => this.normalizeJobData(job));
        } catch (error) {
            this.logger.error(`Error extracting Brightspyre job data: ${error.message}`);
            return [];
        }
    }

    async crawl(searchParams) {
        try {
            if (!await this.initialize()) {
                throw new Error('Failed to initialize Brightspyre crawler');
            }

            this.logger.info(`Starting Brightspyre crawl for: ${searchParams.keyword}`);
            
            const maxPages = searchParams.maxPages || 2;
            let currentPage = 1;
            
            while (currentPage <= maxPages) {
                const searchUrl = this.buildSearchUrl({ ...searchParams, page: currentPage });
                if (!await this.navigateToPage(searchUrl)) break;

                await this.randomDelay(2000, 4000);
                const pageJobs = await this.extractJobData();
                
                if (pageJobs.length === 0) break;

                this.jobs.push(...pageJobs);
                currentPage++;

                const hasNextPage = await this.page.evaluate(() => {
                    const next = document.querySelector('.pagination .next a, a[rel="next"]');
                    return !!next;
                });

                if (!hasNextPage) break;
                await this.randomDelay(3000, 5000);
            }

            return this.jobs;
        } finally {
            await this.cleanup();
        }
    }
}
