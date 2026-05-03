import { JobCrawler } from './src/JobCrawler.js';

console.log('🔍 Testing Rozee.pk crawler...\n');

async function testRozee() {
    try {
        const crawler = new JobCrawler({
            headless: true,
            timeout: 30000
        });
        
        console.log('🌐 Testing Rozee.pk...');
        
        const result = await crawler.crawlSingle('rozee', {
            keyword: 'engineer',
            location: 'Pakistan',
            maxPages: 1
        });
        
        console.log(`✅ Rozee test completed!`);
        console.log(`📊 Found ${result.jobs.length} jobs`);
        
        if (result.jobs.length > 0) {
            console.log('\n📋 Sample jobs:');
            result.jobs.slice(0, 3).forEach((job, index) => {
                console.log(`${index + 1}. ${job.title} - ${job.company}`);
                console.log(`   Location: ${job.location}`);
                console.log(`   Salary: ${job.salary}`);
                console.log(`   URL: ${job.url}`);
                console.log('');
            });
        } else {
            console.log('🔍 Let me check what happened...');
            // Try to debug
        }
        
    } catch (error) {
        console.error('❌ Rozee test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

testRozee();