import { BaseCrawler } from './BaseCrawler.js';

export class LinkedInCrawler extends BaseCrawler {
    constructor(options = {}) {
        super('LinkedIn', options);
        this.baseUrl = 'https://www.linkedin.com';
        this.publicJobsUrl = 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search';
        
        this.logger.warn('LinkedIn Crawler Limitations:');
        this.logger.warn('- LinkedIn has strict anti-bot measures');
        this.logger.warn('- May require authentication for full access');
        this.logger.warn('- Rate limiting is enforced');
        this.logger.warn('- Consider using LinkedIn API for production use');
    }

    buildSearchUrl(searchParams) {
        const {
            keyword = '',
            location = '',
            datePosted = '',
            jobType = '',
            experienceLevel = '',
            start = 0
        } = searchParams;

        const params = new URLSearchParams();
        
        if (keyword) params.set('keywords', keyword);
        if (location) params.set('location', location);
        if (datePosted) params.set('f_TPR', this.mapDatePosted(datePosted));
        if (jobType) params.set('f_JT', this.mapJobType(jobType));
        if (experienceLevel) params.set('f_E', this.mapExperienceLevel(experienceLevel));
        if (start) params.set('start', start);

        return `${this.baseUrl}/jobs/search?${params.toString()}`;
    }

    buildPublicSearchUrl(searchParams) {
        const {
            keyword = '',
            location = 'Pakistan',
            start = 0
        } = searchParams;

        const params = new URLSearchParams();
        params.set('keywords', keyword);
        params.set('location', location);
        params.set('start', start);
        params.set('count', '25');
        params.set('f_LF', 'f_AL'); // All locations

        return `${this.publicJobsUrl}?${params.toString()}`;
    }

    mapDatePosted(datePosted) {
        const mapping = {
            '1': 'r86400',    // Past 24 hours
            '3': 'r259200',   // Past 3 days
            '7': 'r604800',   // Past week
            '14': 'r1209600', // Past 2 weeks
            '30': 'r2592000'  // Past month
        };
        return mapping[datePosted] || '';
    }

    mapJobType(jobType) {
        const mapping = {
            'full-time': 'F',
            'part-time': 'P',
            'contract': 'C',
            'temporary': 'T',
            'volunteer': 'V',
            'internship': 'I'
        };
        return mapping[jobType.toLowerCase()] || '';
    }

    mapExperienceLevel(level) {
        const mapping = {
            'internship': '1',
            'entry': '2',
            'associate': '3',
            'mid': '4',
            'director': '5',
            'executive': '6'
        };
        return mapping[level.toLowerCase()] || '';
    }

    async extractJobData() {
        try {
            await this.page.waitForSelector('.jobs-search__results-list li, .job-result-card', { timeout: 15000 });
            
            const jobs = await this.page.evaluate(() => {
                const jobElements = document.querySelectorAll('.jobs-search__results-list li, .job-result-card, .result-card');
                const extractedJobs = [];

                jobElements.forEach((jobElement) => {
                    try {
                        const titleElement = jobElement.querySelector('.result-card__title, .job-result-card__title, h3 a');
                        const companyElement = jobElement.querySelector('.result-card__subtitle, .job-result-card__subtitle, .job-result-card__subtitle-link');
                        const locationElement = jobElement.querySelector('.job-result-card__location, .result-card__location');
                        const descriptionElement = jobElement.querySelector('.job-result-card__snippet, .result-card__snippet');
                        const linkElement = jobElement.querySelector('.result-card__title a, .job-result-card__title a, h3 a');
                        const dateElement = jobElement.querySelector('.job-result-card__listdate, .result-card__listdate');

                        const job = {
                            title: titleElement?.textContent?.trim() || '',
                            company: companyElement?.textContent?.trim() || '',
                            location: locationElement?.textContent?.trim() || '',
                            description: descriptionElement?.textContent?.trim() || '',
                            url: linkElement?.href || '',
                            datePosted: dateElement?.getAttribute('datetime') || dateElement?.textContent?.trim() || ''
                        };

                        if (job.title && job.company) {
                            extractedJobs.push(job);
                        }
                    } catch (error) {
                        console.error('Error extracting LinkedIn job data:', error);
                    }
                });

                return extractedJobs;
            });

            return jobs.map(job => this.normalizeJobData(job));
        } catch (error) {
            this.logger.error(`Error extracting job data: ${error.message}`);
            this.logger.warn('LinkedIn may be blocking the request or page structure changed');
            return [];
        }
    }

    async extractPublicJobData() {
        try {
            const response = await this.page.evaluate(async (url) => {
                const response = await fetch(url, {
                    headers: {
                        'Accept': 'application/vnd.linkedin.normalized+json+2.1',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });
                return response.text();
            }, this.buildPublicSearchUrl({ keyword: 'software engineer', location: 'Pakistan' }));

            const jobs = JSON.parse(response);
            
            if (jobs && jobs.elements) {
                return jobs.elements.map(job => this.normalizeJobData({
                    title: job.title || '',
                    company: job.companyDetails?.company || '',
                    location: job.formattedLocation || '',
                    description: job.snippet || '',
                    url: job.companyPageUrl || '',
                    datePosted: job.listedAt ? new Date(job.listedAt).toISOString() : ''
                }));
            }

            return [];
        } catch (error) {
            this.logger.error(`Error extracting public job data: ${error.message}`);
            return [];
        }
    }

    async crawl(searchParams) {
        try {
            if (!await this.initialize()) {
                throw new Error('Failed to initialize crawler');
            }

            this.logger.info(`Starting LinkedIn crawl with params: ${JSON.stringify(searchParams)}`);
            this.logger.warn('Attempting LinkedIn crawl - success not guaranteed due to anti-bot measures');
            
            const maxPages = Math.min(searchParams.maxPages || 3, 3); // Limit to 3 pages to avoid detection
            let currentPage = 0;
            
            while (currentPage < maxPages) {
                const searchUrl = this.buildSearchUrl({
                    ...searchParams,
                    start: currentPage * 25
                });

                if (!await this.navigateToPage(searchUrl)) {
                    this.logger.warn(`Failed to load page ${currentPage + 1}, trying alternative method...`);
                    
                    try {
                        const publicJobs = await this.extractPublicJobData();
                        if (publicJobs.length > 0) {
                            this.jobs.push(...publicJobs);
                            this.logger.info(`Alternative method found ${publicJobs.length} jobs`);
                        }
                    } catch (error) {
                        this.logger.error(`Alternative method failed: ${error.message}`);
                    }
                    
                    currentPage++;
                    continue;
                }

                await this.randomDelay(5000, 8000); // Longer delays for LinkedIn

                // Check if we hit a captcha or login requirement
                const needsAuth = await this.page.evaluate(() => {
                    return document.querySelector('.challenge-page, .login-form, .captcha') !== null;
                });

                if (needsAuth) {
                    this.logger.error('LinkedIn requires authentication or captcha - cannot continue');
                    break;
                }

                const pageJobs = await this.extractJobData();
                
                if (pageJobs.length === 0) {
                    this.logger.info('No jobs found on this page');
                    if (currentPage === 0) {
                        this.logger.error('No jobs found on first page - LinkedIn may be blocking access');
                    }
                    break;
                }

                this.jobs.push(...pageJobs);
                this.logger.info(`Page ${currentPage + 1}: Found ${pageJobs.length} jobs (Total: ${this.jobs.length})`);

                currentPage++;
                await this.randomDelay(8000, 12000); // Even longer delays between pages
            }

            this.logger.info(`LinkedIn crawl completed. Total jobs found: ${this.jobs.length}`);
            
            if (this.jobs.length === 0) {
                this.logger.warn('No jobs were found. LinkedIn may be blocking the crawler.');
                this.logger.warn('Consider using the LinkedIn Jobs API for reliable access.');
            }

            return this.jobs;

        } catch (error) {
            this.logger.error(`LinkedIn crawl failed: ${error.message}`);
            this.logger.warn('LinkedIn crawling is challenging due to anti-bot measures');
            this.logger.warn('For production use, consider LinkedIn API or other alternatives');
            throw error;
        } finally {
            await this.cleanup();
        }
    }

    normalizeJobData(job) {
        const normalized = super.normalizeJobData(job);
        
        if (job.url && !job.url.startsWith('http') && job.url.startsWith('/')) {
            normalized.url = `${this.baseUrl}${job.url}`;
        }

        if (normalized.location) {
            normalized.location = normalized.location
                .replace(/\s*,\s*Pakistan/i, '')
                .trim();
        }

        return normalized;
    }
}