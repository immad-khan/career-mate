import { JobCrawler } from './src/JobCrawler.js';

console.log('🕷️ Testing Job Crawler...\n');

async function simpleTest() {
    try {
        const crawler = new JobCrawler({
            headless: true,
            timeout: 15000
        });
        
        console.log('✅ JobCrawler instantiated successfully');
        console.log('📋 Supported sources:', crawler.getSupportedSources());
        
        console.log('\n🧪 Running basic test...');
        
        // Test with minimal parameters
        const result = await crawler.crawlSingle('indeed', {
            keyword: 'engineer',
            location: 'Pakistan',
            maxPages: 1
        });
        
        console.log(`✅ Test completed successfully!`);
        console.log(`📊 Found ${result.jobs.length} jobs`);
        
        if (result.jobs.length > 0) {
            console.log('\n📋 Sample job:');
            const job = result.jobs[0];
            console.log(`   Title: ${job.title}`);
            console.log(`   Company: ${job.company}`);
            console.log(`   Location: ${job.location}`);
        }
        
        console.log('\n🎉 Crawler is working correctly!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

simpleTest();