#!/usr/bin/env node

import { JobCrawler } from './JobCrawler.js';
import { getConfig } from '../config.js';
import fs from 'fs-extra';

async function main() {
    try {
        console.log('🕷️  Job Crawler for Pakistan - Starting...\n');
        
        await fs.ensureDir('data');
        await fs.ensureDir('logs');
        
        const config = getConfig();
        const crawler = new JobCrawler(config.crawler);
        
        const searchParams = {
            keyword: process.argv[2] || 'software engineer',
            location: process.argv[3] || 'Pakistan',
            sources: ['bayt', 'brightspyre', 'rozee'], 
            maxPages: 3,
            filters: {},
            sortBy: 'datePosted'
        };
        
        console.log(`🔍 Searching for: "${searchParams.keyword}" in ${searchParams.location}`);
        console.log(`📊 Sources: ${searchParams.sources.join(', ')}`);
        console.log(`📄 Max pages per source: ${searchParams.maxPages}\n`);
        
        console.log('⏳ This may take a few minutes...\n');
        
        const result = await crawler.searchJobs(searchParams);
        
        console.log('✅ Crawl completed!\n');
        console.log('📈 Results Summary:');
        console.log(`   Total Jobs: ${result.summary.totalJobs}`);
        console.log(`   Sources: ${Object.keys(result.summary.sources).join(', ')}`);
        console.log(`   Top Locations: ${result.summary.topLocations.slice(0, 3).map(([loc]) => loc).join(', ')}`);
        console.log(`   Top Companies: ${result.summary.topCompanies.slice(0, 3).map(([company]) => company).join(', ')}`);
        
        if (result.summary.salaryRanges.withSalary > 0) {
            console.log(`   Salary Range: ${result.summary.salaryRanges.minSalary} - ${result.summary.salaryRanges.maxSalary} PKR`);
        }
        
        console.log(`\n💾 Data saved to: data/ directory`);
        console.log(`📋 Logs saved to: logs/ directory`);
        
        console.log('\n🎉 Job crawling completed successfully!');
        
    } catch (error) {
        console.error('❌ Crawl failed:', error.message);
        process.exit(1);
    }
}

main();