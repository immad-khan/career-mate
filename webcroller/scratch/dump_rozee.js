import puppeteer from 'puppeteer';
import fs from 'fs-extra';

async function dumpRozee() {
    console.log('🚀 Launching browser...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    const url = 'https://www.rozee.pk/job/jsearch/q/software%20engineer';
    console.log(`🌐 Navigating to ${url}...`);
    
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        console.log('✅ Page loaded');
        
        // Wait a bit for dynamic content
        await new Promise(r => setTimeout(r, 5000));
        
        const html = await page.content();
        await fs.writeFile('rozee_dump.html', html);
        console.log('💾 HTML saved to rozee_dump.html');
        
        const text = await page.evaluate(() => document.body.innerText);
        console.log('📄 Page Text snippet:', text.substring(0, 500));
        
        const jobElements = await page.evaluate(() => {
            const results = [];
            // Try common Rozee selectors
            const h3s = Array.from(document.querySelectorAll('h3')).map(h => h.innerText);
            const links = Array.from(document.querySelectorAll('a')).filter(a => a.href.includes('/job/')).map(a => a.innerText);
            return { h3s, links: links.slice(0, 10) };
        });
        
        console.log('🔍 Found H3s:', jobElements.h3s);
        console.log('🔗 Found Job Links:', jobElements.links);

    } catch (e) {
        console.error('❌ Error:', e.message);
    } finally {
        await browser.close();
        console.log('👋 Browser closed');
    }
}

dumpRozee();
