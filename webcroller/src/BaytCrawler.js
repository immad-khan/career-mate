import { BaseCrawler } from './BaseCrawler.js';

export class BaytCrawler extends BaseCrawler {
    constructor(options = {}) {
        super('Bayt', options);
        this.baseUrl = 'https://www.bayt.com';
    }

    buildSearchUrl(searchParams) {
        const {
            keyword = '',
            location = '',
            page = 1
        } = searchParams;

        // Bayt search: /en/jobs/?q=keyword&l=location
        let url = `${this.baseUrl}/en/jobs/?q=${encodeURIComponent(keyword)}`;
        if (location) {
            url += `&l=${encodeURIComponent(location)}`;
        }
        if (page > 1) {
            url += `&page=${page}`;
        }
        return url;
    }

    async extractJobData() {
        try {
            await this.page.waitForSelector('li[data-js-job], .card', { timeout: 15000 }).catch(e => this.logger.warn("Selector wait timeout on Bayt"));
            
            const jobs = await this.page.evaluate(() => {
                const extractedJobs = [];
                const jobCards = document.querySelectorAll('li[data-js-job], .card');
                
                jobCards.forEach((card) => {
                    try {
                        const titleEl = card.querySelector('h2, [data-js-jobname]');
                        const linkEl = titleEl ? titleEl.querySelector('a') : null;
                        
                        if (!titleEl || !linkEl) return;

                        const title = titleEl.textContent?.trim() || '';
                        const jobUrl = linkEl.href || '';
                        
                        const companyEl = card.querySelector('[data-js-jobcompany], .jb-company');
                        const company = companyEl ? companyEl.textContent?.trim() : 'Confidential';
                        
                        const locationEl = card.querySelector('[data-js-joblocation], .jb-loc');
                        const location = locationEl ? locationEl.textContent?.trim() : 'Middle East / Pakistan';
                        
                        const salaryEl = card.querySelector('.jb-salary');
                        const salary = salaryEl ? salaryEl.textContent?.trim() : 'Not specified';

                        if (title.length > 2) {
                            extractedJobs.push({
                                title,
                                company,
                                location,
                                salary,
                                description: title,
                                url: jobUrl,
                                datePosted: ''
                            });
                        }
                    } catch (error) {
                        console.error('Error extracting job from Bayt:', error);
                    }
                });

                return extractedJobs;
            });

            this.logger.info(`Bayt extraction found ${jobs.length} jobs`);
            return jobs.map(job => this.normalizeJobData(job));
        } catch (error) {
            this.logger.error(`Error extracting Bayt job data: ${error.message}`);
            return [];
        }
    }

    async crawl(searchParams) {
        try {
            if (!await this.initialize()) {
                throw new Error('Failed to initialize Bayt crawler');
            }

            this.logger.info(`Starting Bayt crawl for: ${searchParams.keyword}`);
            
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
                    const next = document.querySelector('li.next a');
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
