import { JobCrawler } from './src/JobCrawler.js';

console.log('🔍 Inspecting Indeed page structure...\n');

async function inspectPage() {
    try {
        const crawler = new JobCrawler({
            headless: false, // Show browser for inspection
            timeout: 30000
        });
        
        // Get access to the Indeed crawler
        const indeedCrawler = crawler.crawlers.indeed;
        
        console.log('🌐 Opening Indeed page...');
        await indeedCrawler.initialize();
        
        const url = 'https://pk.indeed.com/jobs?q=engineer&l=Pakistan';
        console.log(`📍 Navigating to: ${url}`);
        
        await indeedCrawler.navigateToPage(url);
        
        // Wait a moment for page to load
        await indeedCrawler.delay(5000);
        
        // Try to find job elements with various selectors
        const jobElements = await indeedCrawler.page.evaluate(() => {
            const selectors = [
                '[data-jk]',
                '.job_seen_beacon',
                '.result',
                '.jobsearch-SerpJobCard',
                '[data-testid="job-title"]',
                '.slider_container .slider_item',
                'h2 a[data-testid="job-title"]',
                '.jobsearch-ResultsList .result'
            ];
            
            const found = {};
            selectors.forEach(selector => {
                const elements = document.querySelectorAll(selector);
                found[selector] = elements.length;
                if (elements.length > 0) {
                    found[selector + '_sample'] = elements[0].outerHTML.substring(0, 200);
                }
            });
            
            // Also check page title and any error messages
            found.pageTitle = document.title;
            found.bodyText = document.body.innerText.substring(0, 500);
            
            return found;
        });
        
        console.log('🔍 Page inspection results:');
        console.log(JSON.stringify(jobElements, null, 2));
        
        await indeedCrawler.cleanup();
        
    } catch (error) {
        console.error('❌ Inspection failed:', error.message);
    }
}

inspectPage();