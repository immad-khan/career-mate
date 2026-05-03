import puppeteer from 'puppeteer';
import axios from 'axios';
import * as cheerio from 'cheerio';
import UserAgent from 'user-agents';
import fs from 'fs-extra';

class RealtimeJobCrawler {
    constructor() {
        this.browser = null;
        this.userAgent = new UserAgent();
        this.proxyList = []; // Add proxy rotation if needed
        this.requestDelay = 2000; // Anti-detection delay

        this.sources = {
            indeed: new IndeedCrawler(),
            glassdoor: new GlassdoorCrawler(),
            linkedin: new LinkedInCrawler(),
            rozee: new RozeeCrawler(),
            mustakbil: new MustakbilCrawler()
        };
    }

    async initialize() {
        console.log('🚀 Initializing Real-time Job Crawler...');

        // Launch browser with anti-detection settings
        this.browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu',
                '--disable-web-security',
                '--disable-features=VizDisplayCompositor',
                '--user-agent=' + this.userAgent.toString()
            ]
        });

        console.log('✅ Browser initialized with anti-detection measures');
    }

    async searchJobs(query, location, maxResults = 50) {
        console.log(`🔍 Searching for "${query}" in "${location}"...`);

        const allJobs = [];
        const searchPromises = [];

        // Search across all sources in parallel
        for (const [sourceName, crawler] of Object.entries(this.sources)) {
            searchPromises.push(
                this.searchFromSource(sourceName, crawler, query, location, maxResults)
                    .catch(error => {
                        console.error(`❌ Error searching ${sourceName}:`, error.message);
                        return [];
                    })
            );
        }

        const results = await Promise.allSettled(searchPromises);

        results.forEach((result, index) => {
            const sourceName = Object.keys(this.sources)[index];
            if (result.status === 'fulfilled') {
                console.log(`✅ ${sourceName}: Found ${result.value.length} jobs`);
                allJobs.push(...result.value);
            } else {
                console.log(`❌ ${sourceName}: Failed to fetch jobs`);
            }
        });

        // Remove duplicates and return sorted results
        const uniqueJobs = this.removeDuplicates(allJobs);
        console.log(`🎯 Total unique jobs found: ${uniqueJobs.length}`);

        return uniqueJobs.slice(0, maxResults);
    }

    async searchFromSource(sourceName, crawler, query, location, maxResults) {
        console.log(`🔎 Searching ${sourceName}...`);

        try {
            const page = await this.browser.newPage();

            // Apply anti-detection measures
            await this.applyAntiDetection(page);

            const jobs = await crawler.search(page, query, location, maxResults);

            await page.close();

            // Add delay between sources
            await this.randomDelay(1000, 3000);

            return jobs.map(job => ({
                ...job,
                source: sourceName,
                searchQuery: query,
                searchLocation: location,
                foundAt: new Date().toISOString()
            }));

        } catch (error) {
            console.error(`Error in ${sourceName}:`, error.message);
            return [];
        }
    }

    async applyAntiDetection(page) {
        // Set random user agent
        await page.setUserAgent(this.userAgent.toString());

        // Set viewport
        await page.setViewport({
            width: 1366 + Math.floor(Math.random() * 200),
            height: 768 + Math.floor(Math.random() * 200)
        });

        // Block images and CSS for faster loading
        await page.setRequestInterception(true);
        page.on('request', (req) => {
            if (req.resourceType() === 'stylesheet' || req.resourceType() === 'image') {
                req.abort();
            } else {
                req.continue();
            }
        });

        // Add human-like mouse movements
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined,
            });
        });
    }

    removeDuplicates(jobs) {
        const seen = new Set();
        return jobs.filter(job => {
            const key = `${job.title}_${job.company}_${job.location}`.toLowerCase();
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    async randomDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

// Indeed Crawler Implementation
class IndeedCrawler {
    async search(page, query, location, maxResults = 20) {
        const jobs = [];

        try {
            const searchUrl = `https://www.indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}`;

            await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

            // Wait for job listings to load
            await page.waitForSelector('[data-testid="job-title"]', { timeout: 10000 });

            const jobElements = await page.$$('[data-testid="job-title"]');

            for (let i = 0; i < Math.min(jobElements.length, maxResults); i++) {
                try {
                    const jobElement = jobElements[i];
                    const jobCard = await jobElement.closest('[data-testid="slider_item"]');

                    if (jobCard) {
                        const job = await this.extractJobDetails(page, jobCard);
                        if (job) jobs.push(job);
                    }
                } catch (error) {
                    console.log(`Error extracting job ${i + 1}:`, error.message);
                }
            }

        } catch (error) {
            console.error('Indeed search error:', error.message);
        }

        return jobs;
    }

    async extractJobDetails(page, jobCard) {
        try {
            const title = await jobCard.$eval('[data-testid="job-title"] span', el => el.textContent?.trim()) || 'N/A';
            const company = await jobCard.$eval('[data-testid="company-name"]', el => el.textContent?.trim()).catch(() => 'N/A');
            const location = await jobCard.$eval('[data-testid="job-location"]', el => el.textContent?.trim()).catch(() => 'N/A');

            // Get job link
            const linkElement = await jobCard.$('[data-testid="job-title"] a');
            let jobUrl = 'N/A';
            if (linkElement) {
                const href = await linkElement.getProperty('href');
                jobUrl = await href.jsonValue();
                if (jobUrl && !jobUrl.startsWith('http')) {
                    jobUrl = 'https://www.indeed.com' + jobUrl;
                }
            }

            // Try to get salary
            const salary = await jobCard.$eval('[data-testid="salary-snippet"]', el => el.textContent?.trim()).catch(() => 'Not specified');

            // Get job snippet/description
            const description = await jobCard.$eval('.slider_item .slider_container', el => el.textContent?.trim()).catch(() => 'No description available');

            return {
                title,
                company,
                location,
                salary,
                description,
                jobUrl,
                requirements: 'See job description',
                deadline: 'Not specified',
                companyLogo: 'N/A'
            };

        } catch (error) {
            console.error('Error extracting Indeed job details:', error.message);
            return null;
        }
    }
}

// Glassdoor Crawler Implementation
class GlassdoorCrawler {
    async search(page, query, location, maxResults = 20) {
        const jobs = [];

        try {
            const searchUrl = `https://www.glassdoor.com/Job/jobs.htm?suggestCount=0&suggestChosen=false&clickSource=searchBtn&typedKeyword=${encodeURIComponent(query)}&sc.keyword=${encodeURIComponent(query)}&locT=&locId=&jobType=`;

            await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

            // Wait for job listings
            await page.waitForSelector('[data-test="job-title"]', { timeout: 10000 });

            const jobElements = await page.$$('[data-test="job-title"]');

            for (let i = 0; i < Math.min(jobElements.length, maxResults); i++) {
                try {
                    const jobElement = jobElements[i];
                    const jobCard = await jobElement.closest('li');

                    if (jobCard) {
                        const job = await this.extractJobDetails(page, jobCard);
                        if (job) jobs.push(job);
                    }
                } catch (error) {
                    console.log(`Error extracting Glassdoor job ${i + 1}:`, error.message);
                }
            }

        } catch (error) {
            console.error('Glassdoor search error:', error.message);
        }

        return jobs;
    }

    async extractJobDetails(page, jobCard) {
        try {
            const title = await jobCard.$eval('[data-test="job-title"]', el => el.textContent?.trim()) || 'N/A';
            const company = await jobCard.$eval('[data-test="employer-name"]', el => el.textContent?.trim()).catch(() => 'N/A');
            const location = await jobCard.$eval('[data-test="job-location"]', el => el.textContent?.trim()).catch(() => 'N/A');

            // Get job link
            const linkElement = await jobCard.$('[data-test="job-title"]');
            let jobUrl = 'N/A';
            if (linkElement) {
                const href = await linkElement.getProperty('href');
                jobUrl = await href.jsonValue();
                if (jobUrl && !jobUrl.startsWith('http')) {
                    jobUrl = 'https://www.glassdoor.com' + jobUrl;
                }
            }

            const salary = await jobCard.$eval('[data-test="detailSalary"]', el => el.textContent?.trim()).catch(() => 'Not specified');
            const description = await jobCard.$eval('.jobDescription', el => el.textContent?.trim()).catch(() => 'No description available');

            return {
                title,
                company,
                location,
                salary,
                description,
                jobUrl,
                requirements: 'See job description',
                deadline: 'Not specified',
                companyLogo: 'N/A'
            };

        } catch (error) {
            console.error('Error extracting Glassdoor job details:', error.message);
            return null;
        }
    }
}

// LinkedIn Crawler Implementation (Note: LinkedIn has strict anti-bot measures)
class LinkedInCrawler {
    async search(page, query, location, maxResults = 20) {
        const jobs = [];

        try {
            // LinkedIn Jobs search URL
            const searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;

            await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

            // Wait for job listings
            await page.waitForSelector('.job-search-card', { timeout: 10000 });

            const jobElements = await page.$$('.job-search-card');

            for (let i = 0; i < Math.min(jobElements.length, maxResults); i++) {
                try {
                    const job = await this.extractJobDetails(page, jobElements[i]);
                    if (job) jobs.push(job);
                } catch (error) {
                    console.log(`Error extracting LinkedIn job ${i + 1}:`, error.message);
                }
            }

        } catch (error) {
            console.error('LinkedIn search error:', error.message);
        }

        return jobs;
    }

    async extractJobDetails(page, jobCard) {
        try {
            const title = await jobCard.$eval('.base-search-card__title', el => el.textContent?.trim()) || 'N/A';
            const company = await jobCard.$eval('.base-search-card__subtitle', el => el.textContent?.trim()).catch(() => 'N/A');
            const location = await jobCard.$eval('.job-search-card__location', el => el.textContent?.trim()).catch(() => 'N/A');

            // Get job link
            const linkElement = await jobCard.$('a');
            let jobUrl = 'N/A';
            if (linkElement) {
                const href = await linkElement.getProperty('href');
                jobUrl = await href.jsonValue();
            }

            return {
                title,
                company,
                location,
                salary: 'Not specified',
                description: 'Click link to view full description',
                jobUrl,
                requirements: 'See job description',
                deadline: 'Not specified',
                companyLogo: 'N/A'
            };

        } catch (error) {
            console.error('Error extracting LinkedIn job details:', error.message);
            return null;
        }
    }
}

// Rozee.pk Crawler (Pakistan)
class RozeeCrawler {
    async search(page, query, location, maxResults = 20) {
        const jobs = [];

        try {
            const searchUrl = `https://www.rozee.pk/jobs?q=${encodeURIComponent(query)}&city=${encodeURIComponent(location)}`;

            await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

            await page.waitForSelector('.job-listing', { timeout: 10000 });

            const jobElements = await page.$$('.job-listing');

            for (let i = 0; i < Math.min(jobElements.length, maxResults); i++) {
                try {
                    const job = await this.extractJobDetails(page, jobElements[i]);
                    if (job) jobs.push(job);
                } catch (error) {
                    console.log(`Error extracting Rozee job ${i + 1}:`, error.message);
                }
            }

        } catch (error) {
            console.error('Rozee search error:', error.message);
        }

        return jobs;
    }

    async extractJobDetails(page, jobCard) {
        try {
            const title = await jobCard.$eval('h3 a', el => el.textContent?.trim()) || 'N/A';
            const company = await jobCard.$eval('.company-name', el => el.textContent?.trim()).catch(() => 'N/A');
            const location = await jobCard.$eval('.location', el => el.textContent?.trim()).catch(() => 'N/A');
            const salary = await jobCard.$eval('.salary', el => el.textContent?.trim()).catch(() => 'Not specified');

            // Get job link
            const linkElement = await jobCard.$('h3 a');
            let jobUrl = 'N/A';
            if (linkElement) {
                const href = await linkElement.getProperty('href');
                jobUrl = await href.jsonValue();
                if (jobUrl && !jobUrl.startsWith('http')) {
                    jobUrl = 'https://www.rozee.pk' + jobUrl;
                }
            }

            const description = await jobCard.$eval('.job-description', el => el.textContent?.trim()).catch(() => 'No description available');

            return {
                title,
                company,
                location,
                salary,
                description,
                jobUrl,
                requirements: 'See job description',
                deadline: 'Not specified',
                companyLogo: 'N/A'
            };

        } catch (error) {
            console.error('Error extracting Rozee job details:', error.message);
            return null;
        }
    }
}

// Mustakbil.com Crawler (Pakistan)
class MustakbilCrawler {
    async search(page, query, location, maxResults = 20) {
        const jobs = [];

        try {
            const searchUrl = `https://www.mustakbil.com/jobs/search/?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`;

            await page.goto(searchUrl, { waitUntil: 'networkidle0', timeout: 30000 });

            await page.waitForSelector('.job-list-item', { timeout: 10000 });

            const jobElements = await page.$$('.job-list-item');

            for (let i = 0; i < Math.min(jobElements.length, maxResults); i++) {
                try {
                    const job = await this.extractJobDetails(page, jobElements[i]);
                    if (job) jobs.push(job);
                } catch (error) {
                    console.log(`Error extracting Mustakbil job ${i + 1}:`, error.message);
                }
            }

        } catch (error) {
            console.error('Mustakbil search error:', error.message);
        }

        return jobs;
    }

    async extractJobDetails(page, jobCard) {
        try {
            const title = await jobCard.$eval('.job-title a', el => el.textContent?.trim()) || 'N/A';
            const company = await jobCard.$eval('.company-name', el => el.textContent?.trim()).catch(() => 'N/A');
            const location = await jobCard.$eval('.job-location', el => el.textContent?.trim()).catch(() => 'N/A');

            // Get job link
            const linkElement = await jobCard.$('.job-title a');
            let jobUrl = 'N/A';
            if (linkElement) {
                const href = await linkElement.getProperty('href');
                jobUrl = await href.jsonValue();
                if (jobUrl && !jobUrl.startsWith('http')) {
                    jobUrl = 'https://www.mustakbil.com' + jobUrl;
                }
            }

            return {
                title,
                company,
                location,
                salary: 'Not specified',
                description: 'Click link to view full description',
                jobUrl,
                requirements: 'See job description',
                deadline: 'Not specified',
                companyLogo: 'N/A'
            };

        } catch (error) {
            console.error('Error extracting Mustakbil job details:', error.message);
            return null;
        }
    }
}

export default RealtimeJobCrawler;