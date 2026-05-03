import { IndeedCrawler } from './IndeedCrawler.js';
import { RozeeCrawler } from './RozeeCrawler.js';
import { LinkedInCrawler } from './LinkedInCrawler.js';
import { JobDataProcessor } from './JobDataProcessor.js';
import winston from 'winston';
import fs from 'fs-extra';

export class JobCrawler {
    constructor(options = {}) {
        this.options = {
            headless: true,
            maxRetries: 3,
            timeout: 30000,
            concurrent: false,
            ...options
        };

        this.crawlers = {
            indeed: new IndeedCrawler(this.options),
            rozee: new RozeeCrawler(this.options),
            linkedin: new LinkedInCrawler(this.options)
        };

        this.processor = new JobDataProcessor();
        this.allJobs = [];

        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [JobCrawler] ${level}: ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/job-crawler.log' })
            ]
        });
    }

    async crawlAll(searchParams) {
        try {
            await fs.ensureDir('logs');
            this.logger.info('Starting comprehensive job crawl');
            this.logger.info(`Search parameters: ${JSON.stringify(searchParams)}`);

            const sources = searchParams.sources || ['indeed', 'rozee'];
            const results = {};

            if (this.options.concurrent) {
                this.logger.info('Running crawlers concurrently');
                const promises = sources.map(async (source) => {
                    try {
                        const crawler = this.crawlers[source];
                        if (!crawler) {
                            throw new Error(`Unknown crawler: ${source}`);
                        }
                        const jobs = await crawler.crawl(searchParams);
                        return { source, jobs, success: true };
                    } catch (error) {
                        this.logger.error(`${source} crawler failed: ${error.message}`);
                        return { source, jobs: [], success: false, error: error.message };
                    }
                });

                const crawlResults = await Promise.allSettled(promises);
                
                for (const result of crawlResults) {
                    if (result.status === 'fulfilled') {
                        const { source, jobs, success, error } = result.value;
                        results[source] = { jobs, success, error };
                        if (success) {
                            this.allJobs.push(...jobs);
                        }
                    }
                }
            } else {
                this.logger.info('Running crawlers sequentially');
                
                for (const source of sources) {
                    try {
                        this.logger.info(`Starting ${source} crawler...`);
                        const crawler = this.crawlers[source];
                        
                        if (!crawler) {
                            throw new Error(`Unknown crawler: ${source}`);
                        }

                        const jobs = await crawler.crawl(searchParams);
                        results[source] = { jobs, success: true };
                        this.allJobs.push(...jobs);
                        
                        this.logger.info(`${source} crawler completed: ${jobs.length} jobs found`);
                        
                        if (sources.indexOf(source) < sources.length - 1) {
                            this.logger.info('Waiting before next crawler...');
                            await this.delay(5000);
                        }
                        
                    } catch (error) {
                        this.logger.error(`${source} crawler failed: ${error.message}`);
                        results[source] = { jobs: [], success: false, error: error.message };
                    }
                }
            }

            this.logger.info(`All crawlers completed. Total raw jobs: ${this.allJobs.length}`);

            const processedJobs = this.processor.removeDuplicates(this.allJobs);
            const summary = this.processor.generateSummary(processedJobs);

            const crawlResult = {
                summary,
                jobs: processedJobs,
                results,
                crawledAt: new Date().toISOString(),
                searchParams
            };

            this.logger.info(`Final result: ${processedJobs.length} unique jobs from ${Object.keys(results).length} sources`);
            
            return crawlResult;

        } catch (error) {
            this.logger.error(`Crawl failed: ${error.message}`);
            throw error;
        }
    }

    async crawlSingle(source, searchParams) {
        try {
            this.logger.info(`Starting ${source} crawl`);
            
            const crawler = this.crawlers[source];
            if (!crawler) {
                throw new Error(`Unknown crawler: ${source}`);
            }

            const jobs = await crawler.crawl(searchParams);
            const summary = this.processor.generateSummary(jobs);

            return {
                source,
                summary,
                jobs,
                crawledAt: new Date().toISOString(),
                searchParams
            };

        } catch (error) {
            this.logger.error(`${source} crawl failed: ${error.message}`);
            throw error;
        }
    }

    async processAndSave(crawlResult, filters = {}, sortBy = 'datePosted', format = 'json') {
        try {
            let { jobs } = crawlResult;
            
            if (Object.keys(filters).length > 0) {
                jobs = this.processor.filterJobs(jobs, filters);
            }
            
            jobs = this.processor.sortJobs(jobs, sortBy);
            const summary = this.processor.generateSummary(jobs);
            
            const finalResult = {
                ...crawlResult,
                summary,
                jobs,
                processedAt: new Date().toISOString(),
                filters,
                sortBy
            };

            const savedFiles = await this.processor.saveProcessedData(jobs, summary);
            
            this.logger.info(`Results processed and saved: ${jobs.length} jobs`);
            
            return {
                result: finalResult,
                files: savedFiles
            };

        } catch (error) {
            this.logger.error(`Failed to process and save results: ${error.message}`);
            throw error;
        }
    }

    async searchJobs(searchParams) {
        const {
            keyword = '',
            location = 'Pakistan',
            sources = ['indeed', 'rozee'],
            maxPages = 3,
            filters = {},
            sortBy = 'datePosted',
            saveResults = true
        } = searchParams;

        try {
            this.logger.info(`Starting job search for "${keyword}" in ${location}`);
            
            const crawlParams = {
                keyword,
                location,
                sources,
                maxPages
            };

            const crawlResult = await this.crawlAll(crawlParams);
            
            if (saveResults) {
                const processed = await this.processAndSave(crawlResult, filters, sortBy);
                return processed.result;
            }
            
            return crawlResult;

        } catch (error) {
            this.logger.error(`Job search failed: ${error.message}`);
            throw error;
        }
    }

    getSupportedSources() {
        return Object.keys(this.crawlers);
    }

    async delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async testCrawler(source) {
        try {
            this.logger.info(`Testing ${source} crawler...`);
            
            const result = await this.crawlSingle(source, {
                keyword: 'software engineer',
                location: 'Pakistan',
                maxPages: 1
            });
            
            this.logger.info(`Test completed: ${result.jobs.length} jobs found`);
            return result;
            
        } catch (error) {
            this.logger.error(`Test failed for ${source}: ${error.message}`);
            throw error;
        }
    }

    clearCache() {
        this.allJobs = [];
        this.logger.info('Cache cleared');
    }

    getStats() {
        return {
            totalJobs: this.allJobs.length,
            sources: Object.keys(this.crawlers),
            lastCrawl: new Date().toISOString()
        };
    }
}