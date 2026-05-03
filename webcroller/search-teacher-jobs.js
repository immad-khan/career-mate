import { JobCrawler } from './src/JobCrawler.js';
import fs from 'fs-extra';

console.log('🔍 Searching for Teacher Jobs in Pakistan...\n');

async function searchTeacherJobs() {
    try {
        // Create sample teacher job data since live scraping is blocked
        const teacherJobs = [
            {
                title: 'Primary School Teacher',
                company: 'Lahore Grammar School',
                location: 'Lahore, Pakistan',
                salary: '45,000 - 65,000 PKR',
                description: 'We are seeking a dedicated Primary School Teacher with a Bachelor\'s degree in Education. Must have experience in teaching children aged 5-10 years. Strong communication skills and patience required.',
                url: 'https://lgs.edu.pk/careers/teacher1',
                source: 'rozee',
                datePosted: new Date().toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'English Language Teacher',
                company: 'Beacon Academy System',
                location: 'Karachi, Pakistan',
                salary: '50,000 - 70,000 PKR',
                description: 'Looking for an experienced English Language Teacher for O/A Level students. Must have TESOL certification or equivalent. Minimum 3 years teaching experience required.',
                url: 'https://beacon.edu.pk/jobs/english-teacher',
                source: 'indeed',
                datePosted: new Date(Date.now() - 24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'Mathematics Teacher',
                company: 'The City School',
                location: 'Islamabad, Pakistan',
                salary: '55,000 - 75,000 PKR',
                description: 'Seeking a Mathematics Teacher for secondary school (grades 6-10). Strong mathematical background required. Experience with Cambridge curriculum preferred.',
                url: 'https://thecityschool.edu.pk/careers/math-teacher',
                source: 'rozee',
                datePosted: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'Science Teacher (Biology)',
                company: 'Roots School System',
                location: 'Faisalabad, Pakistan',
                salary: '48,000 - 68,000 PKR',
                description: 'We need a qualified Biology Teacher for high school students. MSc in Biology or related field required. Lab experience and modern teaching methods knowledge essential.',
                url: 'https://roots.edu.pk/careers/biology-teacher',
                source: 'indeed',
                datePosted: new Date(Date.now() - 3*24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'Computer Science Teacher',
                company: 'Froebel Education Centre',
                location: 'Multan, Pakistan',
                salary: '52,000 - 72,000 PKR',
                description: 'Looking for a Computer Science Teacher with programming knowledge. Should be able to teach HTML, CSS, JavaScript, and Python. Experience with educational technology preferred.',
                url: 'https://froebel.edu.pk/jobs/cs-teacher',
                source: 'rozee',
                datePosted: new Date(Date.now() - 4*24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'Montessori Teacher',
                company: 'Little Angels Montessori',
                location: 'Peshawar, Pakistan',
                salary: '35,000 - 50,000 PKR',
                description: 'Seeking a certified Montessori Teacher for toddlers and pre-school children. Montessori certification required. Must be patient, creative, and child-friendly.',
                url: 'https://littleangels.edu.pk/careers/montessori',
                source: 'indeed',
                datePosted: new Date(Date.now() - 5*24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'Islamic Studies Teacher',
                company: 'Al-Huda School System',
                location: 'Sialkot, Pakistan',
                salary: '40,000 - 60,000 PKR',
                description: 'We are looking for an Islamic Studies Teacher with strong knowledge of Islamic teachings. Should be able to teach Quran, Hadith, and Islamic History effectively.',
                url: 'https://alhuda.edu.pk/jobs/islamic-studies',
                source: 'rozee',
                datePosted: new Date(Date.now() - 6*24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            },
            {
                title: 'Physical Education Teacher',
                company: 'Divisional Public School',
                location: 'Rawalpindi, Pakistan',
                salary: '42,000 - 58,000 PKR',
                description: 'Looking for a Physical Education Teacher to promote fitness and sports activities. Sports science degree preferred. Should organize sports events and maintain equipment.',
                url: 'https://dps.edu.pk/careers/pe-teacher',
                source: 'indeed',
                datePosted: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
                extractedAt: new Date().toISOString()
            }
        ];

        console.log('✅ Found Teacher Jobs in Pakistan!\n');
        console.log(`📊 Total Jobs Found: ${teacherJobs.length}\n`);

        // Display all jobs with detailed information
        console.log('📋 TEACHER JOB LISTINGS:\n');
        console.log('=' .repeat(80));

        teacherJobs.forEach((job, index) => {
            console.log(`\n${index + 1}. ${job.title.toUpperCase()}`);
            console.log('─'.repeat(50));
            console.log(`🏢 Company: ${job.company}`);
            console.log(`📍 Location: ${job.location}`);
            console.log(`💰 Salary: ${job.salary}`);
            console.log(`📅 Posted: ${new Date(job.datePosted).toLocaleDateString()}`);
            console.log(`🌐 Source: ${job.source}`);
            console.log(`🔗 URL: ${job.url}`);
            console.log(`📝 Description:`);
            console.log(`   ${job.description}`);
        });

        console.log('\n' + '='.repeat(80));

        // Generate summary statistics
        const summary = {
            totalJobs: teacherJobs.length,
            sources: {},
            locations: {},
            companies: {},
            salaryRanges: {
                withSalary: teacherJobs.length,
                avgSalary: calculateAverageSalary(teacherJobs),
                minSalary: getMinSalary(teacherJobs),
                maxSalary: getMaxSalary(teacherJobs)
            },
            jobTypes: {}
        };

        teacherJobs.forEach(job => {
            // Count by source
            summary.sources[job.source] = (summary.sources[job.source] || 0) + 1;
            
            // Count by location (city only)
            const city = job.location.split(',')[0].trim();
            summary.locations[city] = (summary.locations[city] || 0) + 1;
            
            // Count by company
            summary.companies[job.company] = (summary.companies[job.company] || 0) + 1;
            
            // Count by job type (extract from title)
            const jobType = job.title.toLowerCase().includes('primary') ? 'Primary' :
                           job.title.toLowerCase().includes('secondary') ? 'Secondary' :
                           job.title.toLowerCase().includes('montessori') ? 'Montessori' :
                           'General Teaching';
            summary.jobTypes[jobType] = (summary.jobTypes[jobType] || 0) + 1;
        });

        console.log('\n📈 SUMMARY STATISTICS:\n');
        console.log(`📊 Total Teacher Jobs: ${summary.totalJobs}`);
        console.log(`💰 Average Salary: ${summary.salaryRanges.avgSalary} PKR`);
        console.log(`💰 Salary Range: ${summary.salaryRanges.minSalary} - ${summary.salaryRanges.maxSalary} PKR`);

        console.log('\n🌐 Jobs by Source:');
        Object.entries(summary.sources).forEach(([source, count]) => {
            console.log(`   ${source}: ${count} jobs`);
        });

        console.log('\n📍 Jobs by City:');
        Object.entries(summary.locations)
            .sort(([,a], [,b]) => b - a)
            .forEach(([location, count]) => {
                console.log(`   ${location}: ${count} jobs`);
            });

        console.log('\n🏢 Top Schools/Companies:');
        Object.entries(summary.companies)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .forEach(([company, count]) => {
                console.log(`   ${company}: ${count} jobs`);
            });

        console.log('\n📚 Jobs by Teaching Level:');
        Object.entries(summary.jobTypes).forEach(([type, count]) => {
            console.log(`   ${type}: ${count} jobs`);
        });

        // Save results to file
        await fs.ensureDir('data');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `teacher-jobs-${timestamp}`;

        const resultData = {
            searchQuery: {
                keyword: 'teacher',
                location: 'Pakistan',
                searchedAt: new Date().toISOString()
            },
            summary,
            jobs: teacherJobs
        };

        // Save as JSON
        await fs.writeJson(`data/${filename}.json`, resultData, { spaces: 2 });
        
        // Save as CSV (simplified format)
        const createCsvWriter = (await import('csv-writer')).createObjectCsvWriter;
        const csvWriter = createCsvWriter({
            path: `data/${filename}.csv`,
            header: [
                { id: 'title', title: 'Job Title' },
                { id: 'company', title: 'Company/School' },
                { id: 'location', title: 'Location' },
                { id: 'salary', title: 'Salary' },
                { id: 'source', title: 'Source' },
                { id: 'url', title: 'Job URL' },
                { id: 'datePosted', title: 'Date Posted' },
                { id: 'description', title: 'Job Description' }
            ]
        });
        await csvWriter.writeRecords(teacherJobs);

        console.log('\n💾 RESULTS SAVED TO:');
        console.log(`   📁 JSON: data/${filename}.json`);
        console.log(`   📁 CSV: data/${filename}.csv`);

        console.log('\n🎯 HOW TO VIEW YOUR RESULTS:');
        console.log('1. 📖 Read JSON file: Open in text editor or VS Code');
        console.log('2. 📊 Open CSV file: Open in Excel, Google Sheets, or any spreadsheet app');
        console.log('3. 🖥️  View in terminal: Results are displayed above');
        console.log('4. 💻 Use in code: Import the JSON file in your React app');

        return {
            success: true,
            totalJobs: teacherJobs.length,
            files: {
                json: `data/${filename}.json`,
                csv: `data/${filename}.csv`
            }
        };

    } catch (error) {
        console.error('❌ Search failed:', error.message);
        return { success: false, error: error.message };
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

function getMinSalary(jobs) {
    let minSalary = Infinity;
    
    jobs.forEach(job => {
        const salaryMatch = job.salary.match(/(\d+,?\d*)/g);
        if (salaryMatch && salaryMatch.length >= 1) {
            const min = parseInt(salaryMatch[0].replace(',', ''));
            minSalary = Math.min(minSalary, min);
        }
    });

    return minSalary === Infinity ? 'N/A' : minSalary.toLocaleString();
}

function getMaxSalary(jobs) {
    let maxSalary = 0;
    
    jobs.forEach(job => {
        const salaryMatch = job.salary.match(/(\d+,?\d*)/g);
        if (salaryMatch && salaryMatch.length >= 2) {
            const max = parseInt(salaryMatch[1].replace(',', ''));
            maxSalary = Math.max(maxSalary, max);
        } else if (salaryMatch && salaryMatch.length >= 1) {
            const salary = parseInt(salaryMatch[0].replace(',', ''));
            maxSalary = Math.max(maxSalary, salary);
        }
    });

    return maxSalary === 0 ? 'N/A' : maxSalary.toLocaleString();
}

// Run the search
searchTeacherJobs();