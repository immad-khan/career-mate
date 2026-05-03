import { BaseCrawler } from './BaseCrawler.js';

export class IndeedCrawler extends BaseCrawler {
    constructor(options = {}) {
        super('Indeed', options);
        this.baseUrl = 'https://pk.indeed.com';
    }

    buildSearchUrl(searchParams) {
        const {
            keyword = '',
            location = '',
            salary = '',
            jobType = '',
            datePosted = '',
            radius = 25,
            start = 0
        } = searchParams;

        const params = new URLSearchParams();
        
        if (keyword) params.set('q', keyword);
        if (location) params.set('l', location);
        if (salary) params.set('salary', salary);
        if (jobType) params.set('jt', jobType);
        if (datePosted) params.set('fromage', datePosted);
        if (radius) params.set('radius', radius);
        if (start) params.set('start', start);

        return `${this.baseUrl}/jobs?${params.toString()}`;
    }

    async extractJobData() {
        try {
            await this.page.waitForSelector('[data-jk]', { timeout: 10000 });
            
            const jobs = await this.page.evaluate(() => {
                const jobElements = document.querySelectorAll('[data-jk]');
                const extractedJobs = [];

                jobElements.forEach((jobElement) => {
                    try {
                        const titleElement = jobElement.querySelector('[data-testid="job-title"] a, h2 a span');
                        const companyElement = jobElement.querySelector('[data-testid="company-name"]');
                        const locationElement = jobElement.querySelector('[data-testid="job-location"]');
                        const salaryElement = jobElement.querySelector('[data-testid="job-snippet"] .salary-snippet, .salary');
                        const descriptionElement = jobElement.querySelector('[data-testid="job-snippet"]');
                        const linkElement = jobElement.querySelector('[data-testid="job-title"] a');
                        const dateElement = jobElement.querySelector('.date');

                        const job = {
                            title: titleElement?.textContent?.trim() || '',
                            company: companyElement?.textContent?.trim() || '',
                            location: locationElement?.textContent?.trim() || '',
                            salary: salaryElement?.textContent?.trim() || '',
                            description: descriptionElement?.textContent?.trim() || '',
                            url: linkElement?.href || '',
                            datePosted: dateElement?.textContent?.trim() || ''
                        };

                        if (job.title && job.company) {
                            extractedJobs.push(job);
                        }
                    } catch (error) {
                        console.error('Error extracting job data:', error);
                    }
                });

                return extractedJobs;
            });

            return jobs.map(job => this.normalizeJobData(job));
        } catch (error) {
            this.logger.error(`Error extracting job data: ${error.message}`);
            return [];
        }
    }

    async crawl(searchParams) {
        try {
            if (!await this.initialize()) {
                throw new Error('Failed to initialize crawler');
            }

            this.logger.info(`Starting Indeed crawl with params: ${JSON.stringify(searchParams)}`);
            
            const maxPages = searchParams.maxPages || 5;
            let currentPage = 0;
            
            while (currentPage < maxPages) {
                const searchUrl = this.buildSearchUrl({
                    ...searchParams,
                    start: currentPage * 10
                });

                if (!await this.navigateToPage(searchUrl)) {
                    this.logger.warn(`Failed to load page ${currentPage + 1}, skipping...`);
                    currentPage++;
                    continue;
                }

                await this.randomDelay(2000, 4000);

                const pageJobs = await this.extractJobData();
                
                if (pageJobs.length === 0) {
                    this.logger.info('No more jobs found, stopping crawl');
                    break;
                }

                this.jobs.push(...pageJobs);
                this.logger.info(`Page ${currentPage + 1}: Found ${pageJobs.length} jobs (Total: ${this.jobs.length})`);

                currentPage++;

                const nextButton = await this.page.$('[data-testid="pagination-page-next"]:not([disabled])');
                if (!nextButton && currentPage < maxPages) {
                    this.logger.info('No next page button found, stopping crawl');
                    break;
                }

                await this.randomDelay(3000, 5000);
            }

            this.logger.info(`Crawl completed. Total jobs found: ${this.jobs.length}`);
            return this.jobs;

        } catch (error) {
            this.logger.error(`Crawl failed: ${error.message}`);
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    async crawlJobDetails(jobUrl) {
        try {
            if (!await this.navigateToPage(jobUrl)) {
                return null;
            }

            await this.page.waitForSelector('#jobDetailsSection, .jobsearch-jobDescriptionText', { timeout: 10000 });

            const jobDetails = await this.page.evaluate(() => {
                const descriptionElement = document.querySelector('#jobDetailsSection, .jobsearch-jobDescriptionText');
                const salaryElement = document.querySelector('.salary, [data-testid="job-compensation"]');
                const benefitsElement = document.querySelector('.benefits, [data-testid="job-benefits"]');
                
                return {
                    fullDescription: descriptionElement?.textContent?.trim() || '',
                    salary: salaryElement?.textContent?.trim() || '',
                    benefits: benefitsElement?.textContent?.trim() || ''
                };
            });

            return jobDetails;
        } catch (error) {
            this.logger.error(`Error crawling job details: ${error.message}`);
            return null;
        }
    }

    normalizeJobData(job) {
        const normalized = super.normalizeJobData(job);
        
        if (job.url && !job.url.startsWith('http')) {
            normalized.url = `${this.baseUrl}${job.url}`;
        }

        if (job.datePosted) {
            try {
                const dateText = job.datePosted.toLowerCase();
                if (dateText.includes('today')) {
                    normalized.datePosted = new Date().toISOString();
                } else if (dateText.includes('yesterday')) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    normalized.datePosted = yesterday.toISOString();
                } else if (dateText.match(/\d+ days? ago/)) {
                    const days = parseInt(dateText.match(/\d+/)[0]);
                    const date = new Date();
                    date.setDate(date.getDate() - days);
                    normalized.datePosted = date.toISOString();
                }
            } catch (error) {
                this.logger.warn(`Failed to parse date: ${job.datePosted}`);
            }
        }

        return normalized;
    }
}