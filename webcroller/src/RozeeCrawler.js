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
            // Wait for any h3 elements (job titles) on the page
            await this.page.waitForSelector('h3 a', { timeout: 15000 });
            
            const jobs = await this.page.evaluate(() => {
                const extractedJobs = [];
                
                // Each job on Rozee has an h3 with a link containing the title
                const titleLinks = document.querySelectorAll('h3 a');
                
                titleLinks.forEach((titleLink) => {
                    try {
                        const title = titleLink.textContent?.trim() || '';
                        let jobUrl = titleLink.href || '';
                        
                        // Skip non-job links
                        if (!title || title.length < 3) return;
                        if (jobUrl && !jobUrl.includes('/job/') && !jobUrl.includes('rozee.pk')) return;
                        
                        // Fix protocol-relative URLs
                        if (jobUrl.startsWith('//')) jobUrl = 'https:' + jobUrl;
                        
                        // Walk up to find the job card container
                        let jobCard = titleLink.parentElement;
                        for (let i = 0; i < 6 && jobCard; i++) {
                            if (jobCard.querySelectorAll('a').length >= 2) break;
                            jobCard = jobCard.parentElement;
                        }
                        
                        if (!jobCard) return;
                        
                        // Get company and location from inline links
                        const allLinks = jobCard.querySelectorAll('a');
                        let company = '';
                        let location = '';
                        
                        allLinks.forEach(link => {
                            const text = link.textContent?.trim() || '';
                            const href = link.href || '';
                            if (href.includes('/company/') || href.includes('/employer/')) {
                                company = text;
                            }
                            if (href.includes('/city/') || href.includes('/location/') || 
                                text.includes('Karachi') || text.includes('Lahore') || 
                                text.includes('Islamabad') || text.includes('Rawalpindi') ||
                                text.includes('Faisalabad') || text.includes('Peshawar') ||
                                text.includes('Remote') || text.includes('Pakistan')) {
                                if (!location) location = text;
                            }
                        });
                        
                        // Look for salary in the card
                        let salary = '';
                        const allText = jobCard.innerText || '';
                        const salaryMatch = allText.match(/(?:PKR|Rs\.?)\s*[\d,]+\s*(?:-|to)\s*(?:PKR|Rs\.?)?\s*[\d,]+/i) ||
                                          allText.match(/[\d,]+K?\s*-\s*[\d,]+K?/);
                        if (salaryMatch) salary = salaryMatch[0].trim();
                        
                        extractedJobs.push({
                            title,
                            company: company || 'See listing',
                            location: location || 'Pakistan',
                            salary: salary || 'Not specified',
                            description: `${title}${company ? ' at ' + company : ''}. ${location ? 'Location: ' + location : ''}`,
                            url: jobUrl,
                            datePosted: ''
                        });
                    } catch (error) {
                        console.error('Error extracting job:', error);
                    }
                });

                return extractedJobs;
            });

            this.logger.info(`Primary extraction found ${jobs.length} jobs`);
            return jobs.map(job => this.normalizeJobData(job));
        } catch (error) {
            this.logger.error(`Error extracting job data: ${error.message}`);
            
            // Fallback: try broader extraction
            try {
                const alternativeJobs = await this.page.evaluate(() => {
                    const extractedJobs = [];
                    const h3s = document.querySelectorAll('h3');
                    
                    h3s.forEach(h3 => {
                        const link = h3.querySelector('a');
                        if (!link || !link.href) return;
                        
                        const title = link.textContent?.trim() || '';
                        let url = link.href || '';
                        if (url.startsWith('//')) url = 'https:' + url;
                        
                        if (title.length > 5) {
                            extractedJobs.push({
                                title,
                                company: 'See listing on Rozee.pk',
                                location: 'Pakistan',
                                salary: 'Not specified',
                                description: title,
                                url,
                                datePosted: ''
                            });
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