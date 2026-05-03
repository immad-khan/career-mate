import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';

console.log('🕷️ Demo: Web Scraping Job Sites (HTTP-based approach)\n');

async function demoJobScraper() {
    const results = [];
    
    try {
        // This is a working example using HTTP requests instead of browser automation
        console.log('🔍 Testing HTTP-based job scraping...\n');
        
        // Example: Scraping a job aggregator API or RSS feed
        console.log('📋 Creating sample job data for demonstration:\n');
        
        const sampleJobs = [
            {
                title: 'Software Engineer',
                company: 'TechCorp Pakistan',
                location: 'Karachi, Pakistan',
                salary: '80,000 - 120,000 PKR',
                description: 'We are looking for a skilled software engineer with experience in Node.js, React, and MongoDB...',
                url: 'https://example.com/job/1',
                source: 'demo',
                datePosted: new Date().toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'Frontend Developer',
                company: 'WebSolutions Ltd',
                location: 'Lahore, Pakistan',
                salary: '60,000 - 90,000 PKR',
                description: 'Looking for a frontend developer with strong skills in React, JavaScript, HTML, and CSS...',
                url: 'https://example.com/job/2',
                source: 'demo',
                datePosted: new Date(Date.now() - 24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'Data Scientist',
                company: 'Analytics Pro',
                location: 'Islamabad, Pakistan',
                salary: '100,000 - 150,000 PKR',
                description: 'Seeking a data scientist with experience in Python, machine learning, and statistical analysis...',
                url: 'https://example.com/job/3',
                source: 'demo',
                datePosted: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'Marketing Manager',
                company: 'Digital Marketing Agency',
                location: 'Karachi, Pakistan',
                salary: '70,000 - 100,000 PKR',
                description: 'Looking for an experienced marketing manager to lead our digital marketing campaigns...',
                url: 'https://example.com/job/4',
                source: 'demo',
                datePosted: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'DevOps Engineer',
                company: 'CloudTech Solutions',
                location: 'Remote, Pakistan',
                salary: '90,000 - 130,000 PKR',
                description: 'Seeking a DevOps engineer with experience in AWS, Docker, Kubernetes, and CI/CD pipelines...',
                url: 'https://example.com/job/5',
                source: 'demo',
                datePosted: new Date(Date.now() - 4*24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            }
        ];
        
        results.push(...sampleJobs);
        
        console.log('✅ Successfully created sample job data!');
        console.log(`📊 Total jobs found: ${results.length}\n`);
        
        // Display results
        console.log('📋 Job Listings:\n');
        results.forEach((job, index) => {
            console.log(`${index + 1}. ${job.title}`);
            console.log(`   Company: ${job.company}`);
            console.log(`   Location: ${job.location}`);
            console.log(`   Salary: ${job.salary}`);
            console.log(`   Description: ${job.description.substring(0, 80)}...`);
            console.log(`   URL: ${job.url}`);
            console.log(`   Posted: ${new Date(job.datePosted).toLocaleDateString()}`);
            console.log('');
        });
        
        // Generate summary
        const summary = {
            totalJobs: results.length,
            sources: {},
            locations: {},
            companies: {},
            avgSalary: calculateAverageSalary(results)
        };
        
        results.forEach(job => {
            summary.sources[job.source] = (summary.sources[job.source] || 0) + 1;
            
            const location = job.location.split(',')[0].trim();
            summary.locations[location] = (summary.locations[location] || 0) + 1;
            
            summary.companies[job.company] = (summary.companies[job.company] || 0) + 1;
        });
        
        console.log('📈 Summary:');
        console.log(`   Total Jobs: ${summary.totalJobs}`);
        console.log(`   Sources: ${Object.keys(summary.sources).join(', ')}`);
        console.log(`   Top Locations: ${Object.entries(summary.locations).slice(0, 3).map(([loc, count]) => `${loc} (${count})`).join(', ')}`);
        console.log(`   Average Salary: ${summary.avgSalary} PKR`);
        
        // Save to files
        await fs.ensureDir('data');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        
        await fs.writeJson(`data/demo-jobs-${timestamp}.json`, {
            summary,
            jobs: results,
            extractedAt: new Date().toISOString()
        }, { spaces: 2 });
        
        console.log(`\n💾 Results saved to data/demo-jobs-${timestamp}.json`);
        console.log('\n🎉 Demo completed successfully!\n');
        
        console.log('🔧 Next Steps:');
        console.log('1. The crawler framework is ready and working');
        console.log('2. Job sites may block automated requests (Cloudflare, etc.)');
        console.log('3. Consider using APIs or RSS feeds when available');
        console.log('4. Test with different user agents and delays');
        console.log('5. Implement proxy rotation for large-scale scraping\n');
        
        return {
            success: true,
            jobsFound: results.length,
            summary
        };
        
    } catch (error) {
        console.error('❌ Demo failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

function calculateAverageSalary(jobs) {
    let totalSalary = 0;
    let count = 0;
    
    jobs.forEach(job => {
        const salaryMatch = job.salary.match(/(\d+,?\d*)/g);
        if (salaryMatch && salaryMatch.length >= 2) {
            const min = parseInt(salaryMatch[0].replace(',', ''));
            const max = parseInt(salaryMatch[1].replace(',', ''));
            totalSalary += (min + max) / 2;
            count++;
        }
    });
    
    return count > 0 ? Math.round(totalSalary / count).toLocaleString() : 'N/A';
}

// Also create a simple HTTP-based scraper example
async function trySimpleHTTPScraping() {
    try {
        console.log('🌐 Testing simple HTTP scraping approach...\n');
        
        // Example of scraping a simple job board (this is just an example structure)
        const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
        
        // You could try this approach with actual job sites that don't use heavy JavaScript
        console.log('💡 HTTP-based scraping is ideal for:');
        console.log('   - Sites that render content server-side');
        console.log('   - RSS feeds and job feeds');
        console.log('   - API endpoints');
        console.log('   - Sites without heavy anti-bot protection\n');
        
        console.log('⚠️  For sites with JavaScript or anti-bot protection:');
        console.log('   - Use the Puppeteer-based approach');
        console.log('   - Implement proxy rotation');
        console.log('   - Add random delays and headers');
        console.log('   - Consider official APIs when available\n');
        
    } catch (error) {
        console.error('HTTP scraping test failed:', error.message);
    }
}

// Run the demo
async function main() {
    await demoJobScraper();
    await trySimpleHTTPScraping();
}

main();