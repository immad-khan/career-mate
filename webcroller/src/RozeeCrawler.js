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
            page = 1
        } = searchParams;

        // Rozee uses path-based search: /job/jsearch/q/keyword
        let url = `${this.baseUrl}/job/jsearch/q/${encodeURIComponent(keyword)}`;
        if (page > 1) {
            url += `/fp/${page}`;
        }
        return url;
    }

    async extractJobData() {
        try {
            // Rozee often has overlays
            await this.page.evaluate(() => {
                const overlays = document.querySelectorAll('.modal-backdrop, .fade.in, #cookie-consent, .tvStory');
                overlays.forEach(el => el.remove());
                document.body.classList.remove('modal-open');
            }).catch(() => {});

            // Wait for the main job container
            await this.page.waitForSelector('.job', { timeout: 20000 })
                .catch(e => this.logger.warn("Job containers (.job) not found within timeout"));
            
            const jobs = await this.page.evaluate(() => {
                const extractedJobs = [];
                const containers = document.querySelectorAll('.job');
                
                containers.forEach(card => {
                    try {
                        const titleLink = card.querySelector('h3 a');
                        if (!titleLink) return;

                        const title = titleLink.textContent?.trim() || '';
                        const jobUrl = titleLink.href || '';

                        if (!title || title.length < 3) return;

                        // Company and Location are inside .cname bdi
                        const cnameBdi = card.querySelector('.cname bdi');
                        let company = 'See listing';
                        let location = 'Pakistan';

                        if (cnameBdi) {
                            const links = cnameBdi.querySelectorAll('a');
                            if (links.length > 0) {
                                company = links[0].textContent?.trim().replace(/,\s*$/, '') || 'See listing';
                            }
                            if (links.length > 1) {
                                location = links[1].textContent?.trim() || 'Pakistan';
                            }
                        }

                        // Salary is inside .rz-salary's sibling span
                        const salaryIcon = card.querySelector('.rz-salary');
                        let salary = 'Not specified';
                        if (salaryIcon && salaryIcon.nextElementSibling) {
                            salary = salaryIcon.nextElementSibling.textContent?.trim() || 'Not specified';
                        }

                        // Date posted
                        const dateIcon = card.querySelector('.rz-calendar');
                        let datePosted = '';
                        if (dateIcon && dateIcon.parentElement) {
                            datePosted = dateIcon.parentElement.textContent?.trim() || '';
                        }

                        extractedJobs.push({
                            title,
                            company,
                            location,
                            salary,
                            description: title,
                            url: jobUrl,
                            datePosted
                        });
                    } catch (e) {}
                });

                return extractedJobs;
            });

            this.logger.info(`Rozee extraction found ${jobs.length} jobs`);
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