import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import winston from 'winston';
import UserAgent from 'user-agents';

export class BaseCrawler {
    constructor(name, options = {}) {
        this.name = name;
        this.options = {
            headless: true,
            slowMo: 100,
            timeout: 30000,
            maxRetries: 3,
            delay: 2000,
            ...options
        };
        
        this.browser = null;
        this.page = null;
        this.jobs = [];
        
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [${this.name}] ${level}: ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: `logs/${this.name}.log` })
            ]
        });
    }

    async initialize() {
        try {
            this.logger.info('Initializing browser...');
            this.browser = await puppeteer.launch({
                headless: this.options.headless,
                slowMo: this.options.slowMo,
                protocolTimeout: 60000,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu',
                    '--disable-web-security',
                    '--disable-features=VizDisplayCompositor'
                ]
            });

            this.page = await this.browser.newPage();
            
            const userAgent = new UserAgent();
            await this.page.setUserAgent(userAgent.toString());
            
            await this.page.setViewport({ width: 1366, height: 768 });
            
            await this.page.setRequestInterception(true);
            this.page.on('request', (req) => {
                if (req.resourceType() === 'stylesheet' || 
                    req.resourceType() === 'image' ||
                    req.resourceType() === 'font') {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            this.logger.info('Browser initialized successfully');
            return true;
        } catch (error) {
            this.logger.error(`Failed to initialize browser: ${error.message}`);
            return false;
        }
    }

    async navigateToPage(url, retries = 0) {
        try {
            this.logger.info(`Navigating to: ${url}`);
            await this.page.goto(url, {
                waitUntil: 'domcontentloaded',
                timeout: this.options.timeout
            });
            
            await this.randomDelay();
            return true;
        } catch (error) {
            if (retries < this.options.maxRetries) {
                this.logger.warn(`Navigation failed, retrying... (${retries + 1}/${this.options.maxRetries})`);
                await this.delay(this.options.delay * (retries + 1));
                return this.navigateToPage(url, retries + 1);
            }
            this.logger.error(`Failed to navigate to ${url}: ${error.message}`);
            return false;
        }
    }

    async extractJobData(selectors) {
        throw new Error('extractJobData method must be implemented by subclass');
    }

    async crawl(searchParams) {
        throw new Error('crawl method must be implemented by subclass');
    }

    normalizeJobData(job) {
        return {
            title: job.title?.trim() || 'N/A',
            company: job.company?.trim() || 'N/A',
            location: job.location?.trim() || 'N/A',
            salary: job.salary?.trim() || 'Not specified',
            description: job.description?.trim() || 'N/A',
            url: job.url || 'N/A',
            source: this.name,
            datePosted: job.datePosted || new Date().toISOString(),
            extractedAt: new Date().toISOString()
        };
    }

    async saveResults(format = 'json') {
        try {
            await fs.ensureDir('data');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `data/${this.name}-jobs-${timestamp}`;

            if (format === 'json') {
                const filepath = `${filename}.json`;
                await fs.writeJson(filepath, this.jobs, { spaces: 2 });
                this.logger.info(`Results saved to ${filepath}`);
            } else if (format === 'csv') {
                const createCsvWriter = (await import('csv-writer')).createObjectCsvWriter;
                const csvWriter = createCsvWriter({
                    path: `${filename}.csv`,
                    header: [
                        { id: 'title', title: 'Title' },
                        { id: 'company', title: 'Company' },
                        { id: 'location', title: 'Location' },
                        { id: 'salary', title: 'Salary' },
                        { id: 'description', title: 'Description' },
                        { id: 'url', title: 'URL' },
                        { id: 'source', title: 'Source' },
                        { id: 'datePosted', title: 'Date Posted' },
                        { id: 'extractedAt', title: 'Extracted At' }
                    ]
                });
                await csvWriter.writeRecords(this.jobs);
                this.logger.info(`Results saved to ${filename}.csv`);
            }

            return this.jobs.length;
        } catch (error) {
            this.logger.error(`Failed to save results: ${error.message}`);
            return 0;
        }
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async randomDelay(min = 1000, max = 3000) {
        const delay = Math.floor(Math.random() * (max - min + 1)) + min;
        await this.delay(delay);
    }

    async cleanup() {
        try {
            if (this.browser) {
                await this.browser.close();
                this.logger.info('Browser closed successfully');
            }
        } catch (error) {
            this.logger.error(`Error during cleanup: ${error.message}`);
        }
    }

    getJobCount() {
        return this.jobs.length;
    }

    clearJobs() {
        this.jobs = [];
    }
}