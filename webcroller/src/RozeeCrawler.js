import { BaseCrawler } from './BaseCrawler.js';

export class RozeeCrawler extends BaseCrawler {
    constructor(options = {}) {
        super('Rozee', options);
        this.baseUrl = 'https://www.rozee.pk';
    }

    buildSearchUrl(searchParams) {
        const {
            keyword = '',
            location = '',
            category = '',
            experience = '',
            salary = '',
            jobType = '',
            page = 1
        } = searchParams;

        const params = new URLSearchParams();
        
        if (keyword) params.set('q', keyword);
        if (location) params.set('l', location);
        if (category) params.set('c', category);
        if (experience) params.set('e', experience);
        if (salary) params.set('s', salary);
        if (jobType) params.set('jt', jobType);
        if (page > 1) params.set('p', page);

        return `${this.baseUrl}/jobs?${params.toString()}`;
    }

    async extractJobData() {
        try {
            await this.page.waitForSelector('.job-listing, .job-item, [data-job-id]', { timeout: 10000 });
            
            const jobs = await this.page.evaluate(() => {
                const jobElements = document.querySelectorAll('.job-listing, .job-item, .job-tile, .job-card');
                const extractedJobs = [];

                jobElements.forEach((jobElement) => {
                    try {
                        const titleElement = jobElement.querySelector('.job-title a, .title a, h3 a, h4 a');
                        const companyElement = jobElement.querySelector('.company-name, .company, .employer');
                        const locationElement = jobElement.querySelector('.location, .job-location');
                        const salaryElement = jobElement.querySelector('.salary, .package, .compensation');
                        const descriptionElement = jobElement.querySelector('.job-description, .description, .snippet');
                        const linkElement = jobElement.querySelector('.job-title a, .title a, h3 a, h4 a');
                        const dateElement = jobElement.querySelector('.date, .posted-date, .job-date');
                        const typeElement = jobElement.querySelector('.job-type, .type');

                        const job = {
                            title: titleElement?.textContent?.trim() || '',
                            company: companyElement?.textContent?.trim() || '',
                            location: locationElement?.textContent?.trim() || '',
                            salary: salaryElement?.textContent?.trim() || '',
                            description: descriptionElement?.textContent?.trim() || '',
                            url: linkElement?.href || '',
                            datePosted: dateElement?.textContent?.trim() || '',
                            jobType: typeElement?.textContent?.trim() || ''
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
            
            try {
                const alternativeJobs = await this.page.evaluate(() => {
                    const jobElements = document.querySelectorAll('div[class*="job"], div[class*="listing"], tr[class*="job"]');
                    const extractedJobs = [];

                    jobElements.forEach((jobElement) => {
                        try {
                            const links = jobElement.querySelectorAll('a');
                            const texts = Array.from(jobElement.querySelectorAll('*')).map(el => el.textContent?.trim()).filter(Boolean);
                            
                            if (texts.length > 2) {
                                const job = {
                                    title: texts[0] || '',
                                    company: texts[1] || '',
                                    location: texts.find(t => t.includes('Karachi') || t.includes('Lahore') || t.includes('Islamabad')) || '',
                                    salary: texts.find(t => t.includes('Rs') || t.includes('PKR') || t.includes('salary')) || '',
                                    description: texts.slice(2).join(' ').substring(0, 200) + '...' || '',
                                    url: links[0]?.href || '',
                                    datePosted: texts.find(t => t.includes('ago') || t.includes('day') || t.includes('hour')) || ''
                                };

                                if (job.title.length > 5 && job.company.length > 2) {
                                    extractedJobs.push(job);
                                }
                            }
                        } catch (error) {
                            console.error('Error in alternative extraction:', error);
                        }
                    });

                    return extractedJobs.slice(0, 20);
                });

                this.logger.info(`Alternative extraction found ${alternativeJobs.length} jobs`);
                return alternativeJobs.map(job => this.normalizeJobData(job));
            } catch (altError) {
                this.logger.error(`Alternative extraction also failed: ${altError.message}`);
                return [];
            }
        }
    }

    async crawl(searchParams) {
        try {
            if (!await this.initialize()) {
                throw new Error('Failed to initialize crawler');
            }

            this.logger.info(`Starting Rozee crawl with params: ${JSON.stringify(searchParams)}`);
            
            const maxPages = searchParams.maxPages || 5;
            let currentPage = 1;
            
            while (currentPage <= maxPages) {
                const searchUrl = this.buildSearchUrl({
                    ...searchParams,
                    page: currentPage
                });

                if (!await this.navigateToPage(searchUrl)) {
                    this.logger.warn(`Failed to load page ${currentPage}, skipping...`);
                    currentPage++;
                    continue;
                }

                await this.randomDelay(3000, 5000);

                const pageJobs = await this.extractJobData();
                
                if (pageJobs.length === 0) {
                    this.logger.info('No more jobs found, stopping crawl');
                    break;
                }

                this.jobs.push(...pageJobs);
                this.logger.info(`Page ${currentPage}: Found ${pageJobs.length} jobs (Total: ${this.jobs.length})`);

                currentPage++;

                const hasNextPage = await this.page.evaluate(() => {
                    const nextButton = document.querySelector('.next, .pagination .next, a[title*="Next"]');
                    return nextButton && !nextButton.classList.contains('disabled');
                });

                if (!hasNextPage && currentPage <= maxPages) {
                    this.logger.info('No next page found, stopping crawl');
                    break;
                }

                await this.randomDelay(4000, 6000);
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

            await this.page.waitForSelector('.job-detail, .job-description, .description', { timeout: 10000 });

            const jobDetails = await this.page.evaluate(() => {
                const descriptionElement = document.querySelector('.job-detail, .job-description, .description');
                const salaryElement = document.querySelector('.salary, .package, .compensation');
                const requirementsElement = document.querySelector('.requirements, .qualifications');
                const benefitsElement = document.querySelector('.benefits, .perks');
                
                return {
                    fullDescription: descriptionElement?.textContent?.trim() || '',
                    salary: salaryElement?.textContent?.trim() || '',
                    requirements: requirementsElement?.textContent?.trim() || '',
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

        if (normalized.location) {
            normalized.location = normalized.location
                .replace(/\s*,\s*Pakistan/i, '')
                .replace(/\s*,\s*PK/i, '')
                .trim();
        }

        if (job.salary && job.salary.includes('Rs')) {
            normalized.salary = job.salary.replace(/Rs\.?\s*/g, 'PKR ');
        }

        if (job.datePosted) {
            try {
                const dateText = job.datePosted.toLowerCase();
                if (dateText.includes('today') || dateText.includes('آج')) {
                    normalized.datePosted = new Date().toISOString();
                } else if (dateText.includes('yesterday') || dateText.includes('کل')) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    normalized.datePosted = yesterday.toISOString();
                } else if (dateText.match(/\d+ days? ago/) || dateText.match(/\d+ دن/)) {
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