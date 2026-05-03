import { JobCrawler } from '../src/JobCrawler.js';
import { getConfig } from '../config.js';

async function basicExample() {
    const config = getConfig();
    const crawler = new JobCrawler(config.crawler);
    
    try {
        console.log('Basic Job Search Example\n');
        
        const result = await crawler.searchJobs({
            keyword: 'web developer',
            location: 'Karachi',
            sources: ['indeed', 'rozee'],
            maxPages: 2
        });
        
        console.log(`Found ${result.summary.totalJobs} jobs`);
        console.log(`Sources: ${Object.keys(result.summary.sources).join(', ')}`);
        
        console.log('\nTop 5 Jobs:');
        result.jobs.slice(0, 5).forEach((job, index) => {
            console.log(`${index + 1}. ${job.title} at ${job.company} (${job.location})`);
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function filteredExample() {
    const config = getConfig();
    const crawler = new JobCrawler(config.crawler);
    
    try {
        console.log('\nFiltered Search Example\n');
        
        const result = await crawler.searchJobs({
            keyword: 'software engineer',
            location: 'Pakistan',
            sources: ['indeed'],
            maxPages: 2,
            filters: {
                keywords: ['javascript', 'react', 'node'],
                locations: ['Karachi', 'Lahore']
            }
        });
        
        console.log(`Found ${result.summary.totalJobs} filtered jobs`);
        
        console.log('\nFiltered Jobs:');
        result.jobs.slice(0, 3).forEach((job, index) => {
            console.log(`${index + 1}. ${job.title} at ${job.company}`);
            console.log(`   Location: ${job.location}`);
            console.log(`   Description: ${job.description.substring(0, 100)}...`);
            console.log('');
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function singleSourceExample() {
    const config = getConfig();
    const crawler = new JobCrawler(config.crawler);
    
    try {
        console.log('\nSingle Source Example (Rozee)\n');
        
        const result = await crawler.crawlSingle('rozee', {
            keyword: 'marketing manager',
            location: 'Lahore',
            maxPages: 1
        });
        
        console.log(`Found ${result.jobs.length} jobs from ${result.source}`);
        
        console.log('\nJobs from Rozee:');
        result.jobs.slice(0, 3).forEach((job, index) => {
            console.log(`${index + 1}. ${job.title} at ${job.company}`);
            console.log(`   Salary: ${job.salary}`);
            console.log('');
        });
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

async function runExamples() {
    await basicExample();
    await filteredExample();
    await singleSourceExample();
}

if (import.meta.url === `file://${process.argv[1]}`) {
    runExamples();
}