import fs from 'fs-extra';
import winston from 'winston';

export class JobDataProcessor {
    constructor() {
        this.logger = winston.createLogger({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({ timestamp, level, message }) => {
                    return `${timestamp} [JobDataProcessor] ${level}: ${message}`;
                })
            ),
            transports: [
                new winston.transports.Console(),
                new winston.transports.File({ filename: 'logs/processor.log' })
            ]
        });
    }

    removeDuplicates(jobs) {
        this.logger.info(`Removing duplicates from ${jobs.length} jobs`);
        
        const seen = new Set();
        const uniqueJobs = [];
        
        for (const job of jobs) {
            const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}-${job.location.toLowerCase()}`;
            
            if (!seen.has(key)) {
                seen.add(key);
                uniqueJobs.push(job);
            }
        }
        
        this.logger.info(`Removed ${jobs.length - uniqueJobs.length} duplicates, ${uniqueJobs.length} unique jobs remaining`);
        return uniqueJobs;
    }

    filterJobs(jobs, filters = {}) {
        this.logger.info(`Applying filters to ${jobs.length} jobs`);
        
        let filteredJobs = [...jobs];
        
        if (filters.minSalary) {
            filteredJobs = filteredJobs.filter(job => {
                const salary = this.extractNumericSalary(job.salary);
                return salary >= filters.minSalary;
            });
        }
        
        if (filters.maxSalary) {
            filteredJobs = filteredJobs.filter(job => {
                const salary = this.extractNumericSalary(job.salary);
                return salary <= filters.maxSalary;
            });
        }
        
        if (filters.keywords && filters.keywords.length > 0) {
            filteredJobs = filteredJobs.filter(job => {
                const searchText = `${job.title} ${job.description}`.toLowerCase();
                return filters.keywords.some(keyword => 
                    searchText.includes(keyword.toLowerCase())
                );
            });
        }
        
        if (filters.locations && filters.locations.length > 0) {
            filteredJobs = filteredJobs.filter(job => {
                return filters.locations.some(location => 
                    job.location.toLowerCase().includes(location.toLowerCase())
                );
            });
        }
        
        if (filters.companies && filters.companies.length > 0) {
            filteredJobs = filteredJobs.filter(job => {
                return filters.companies.some(company => 
                    job.company.toLowerCase().includes(company.toLowerCase())
                );
            });
        }
        
        if (filters.excludeKeywords && filters.excludeKeywords.length > 0) {
            filteredJobs = filteredJobs.filter(job => {
                const searchText = `${job.title} ${job.description}`.toLowerCase();
                return !filters.excludeKeywords.some(keyword => 
                    searchText.includes(keyword.toLowerCase())
                );
            });
        }
        
        this.logger.info(`Applied filters: ${jobs.length} -> ${filteredJobs.length} jobs`);
        return filteredJobs;
    }

    extractNumericSalary(salaryText) {
        if (!salaryText || typeof salaryText !== 'string') return 0;
        
        const numbers = salaryText.match(/\d+/g);
        if (!numbers) return 0;
        
        const isAnnual = salaryText.toLowerCase().includes('year') || 
                        salaryText.toLowerCase().includes('annual') ||
                        salaryText.toLowerCase().includes('pa');
        const isMonthly = salaryText.toLowerCase().includes('month') || 
                         salaryText.toLowerCase().includes('pm');
        
        let salary = parseInt(numbers[0]);
        
        if (salaryText.includes('k') || salaryText.includes('K')) {
            salary *= 1000;
        } else if (salaryText.includes('lac') || salaryText.includes('lakh')) {
            salary *= 100000;
        }
        
        if (isMonthly && salary < 1000000) {
            salary *= 12;
        }
        
        return salary;
    }

    sortJobs(jobs, sortBy = 'datePosted', order = 'desc') {
        this.logger.info(`Sorting ${jobs.length} jobs by ${sortBy} (${order})`);
        
        return jobs.sort((a, b) => {
            let aValue = a[sortBy];
            let bValue = b[sortBy];
            
            if (sortBy === 'datePosted') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else if (sortBy === 'salary') {
                aValue = this.extractNumericSalary(aValue);
                bValue = this.extractNumericSalary(bValue);
            }
            
            if (order === 'desc') {
                return bValue > aValue ? 1 : -1;
            } else {
                return aValue > bValue ? 1 : -1;
            }
        });
    }

    generateSummary(jobs) {
        const summary = {
            totalJobs: jobs.length,
            sources: {},
            locations: {},
            companies: {},
            salaryRanges: {
                withSalary: 0,
                withoutSalary: 0,
                avgSalary: 0,
                minSalary: Infinity,
                maxSalary: 0
            },
            dateRange: {
                oldest: null,
                newest: null
            }
        };

        let totalSalary = 0;
        let salaryCount = 0;

        jobs.forEach(job => {
            summary.sources[job.source] = (summary.sources[job.source] || 0) + 1;
            
            if (job.location && job.location !== 'N/A') {
                const location = job.location.split(',')[0].trim();
                summary.locations[location] = (summary.locations[location] || 0) + 1;
            }
            
            if (job.company && job.company !== 'N/A') {
                summary.companies[job.company] = (summary.companies[job.company] || 0) + 1;
            }
            
            const salary = this.extractNumericSalary(job.salary);
            if (salary > 0) {
                summary.salaryRanges.withSalary++;
                totalSalary += salary;
                salaryCount++;
                summary.salaryRanges.minSalary = Math.min(summary.salaryRanges.minSalary, salary);
                summary.salaryRanges.maxSalary = Math.max(summary.salaryRanges.maxSalary, salary);
            } else {
                summary.salaryRanges.withoutSalary++;
            }
            
            const jobDate = new Date(job.datePosted);
            if (!isNaN(jobDate)) {
                if (!summary.dateRange.oldest || jobDate < summary.dateRange.oldest) {
                    summary.dateRange.oldest = jobDate;
                }
                if (!summary.dateRange.newest || jobDate > summary.dateRange.newest) {
                    summary.dateRange.newest = jobDate;
                }
            }
        });

        if (salaryCount > 0) {
            summary.salaryRanges.avgSalary = Math.round(totalSalary / salaryCount);
        }

        if (summary.salaryRanges.minSalary === Infinity) {
            summary.salaryRanges.minSalary = 0;
        }

        summary.topLocations = Object.entries(summary.locations)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
            
        summary.topCompanies = Object.entries(summary.companies)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        return summary;
    }

    async saveProcessedData(jobs, summary, filename = null) {
        try {
            await fs.ensureDir('data');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const baseFilename = filename || `processed-jobs-${timestamp}`;

            await fs.writeJson(`data/${baseFilename}.json`, {
                summary,
                jobs,
                processedAt: new Date().toISOString()
            }, { spaces: 2 });

            const createCsvWriter = (await import('csv-writer')).createObjectCsvWriter;
            const csvWriter = createCsvWriter({
                path: `data/${baseFilename}.csv`,
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
            await csvWriter.writeRecords(jobs);

            await fs.writeJson(`data/${baseFilename}-summary.json`, summary, { spaces: 2 });

            this.logger.info(`Processed data saved to data/${baseFilename}.*`);
            return {
                jsonFile: `data/${baseFilename}.json`,
                csvFile: `data/${baseFilename}.csv`,
                summaryFile: `data/${baseFilename}-summary.json`
            };
        } catch (error) {
            this.logger.error(`Failed to save processed data: ${error.message}`);
            throw error;
        }
    }

    async loadJobsFromFile(filePath) {
        try {
            const data = await fs.readJson(filePath);
            if (data.jobs) {
                return data.jobs;
            } else if (Array.isArray(data)) {
                return data;
            } else {
                throw new Error('Invalid file format');
            }
        } catch (error) {
            this.logger.error(`Failed to load jobs from file: ${error.message}`);
            throw error;
        }
    }

    async mergeJobsFromFiles(filePaths) {
        const allJobs = [];
        
        for (const filePath of filePaths) {
            try {
                const jobs = await this.loadJobsFromFile(filePath);
                allJobs.push(...jobs);
                this.logger.info(`Loaded ${jobs.length} jobs from ${filePath}`);
            } catch (error) {
                this.logger.error(`Failed to load jobs from ${filePath}: ${error.message}`);
            }
        }
        
        return this.removeDuplicates(allJobs);
    }
}