#!/usr/bin/env node

import readline from 'readline';
import { spawn } from 'child_process';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🕷️ JOB CRAWLER MENU - Search Any Job in Pakistan\n');

function showMenu() {
    console.log('════════════════════════════════════════════════');
    console.log('📋 POPULAR JOB SEARCHES:');
    console.log('════════════════════════════════════════════════');
    console.log('1️⃣  Software Engineer');
    console.log('2️⃣  Teacher');
    console.log('3️⃣  Doctor/Medical');
    console.log('4️⃣  Nurse');
    console.log('5️⃣  Accountant');
    console.log('6️⃣  Marketing Manager');
    console.log('7️⃣  Sales Executive');
    console.log('8️⃣  Data Scientist');
    console.log('9️⃣  Graphic Designer');
    console.log('🔟 Engineer (General)');
    console.log('🆕 Custom Search');
    console.log('❌ Exit');
    console.log('════════════════════════════════════════════════\n');
}

function runJobSearch(jobType, location = 'Pakistan', maxJobs = 8) {
    return new Promise((resolve, reject) => {
        console.log(`🔍 Searching for ${jobType} jobs...\n`);
        
        const child = spawn('node', ['search-any-job.js', jobType, location, maxJobs.toString()], {
            stdio: 'inherit',
            shell: true
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Search failed with code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

async function handleChoice(choice) {
    let jobType, location, maxJobs;

    switch(choice.trim()) {
        case '1':
            await runJobSearch('Software Engineer');
            break;
        case '2':
            await runJobSearch('Teacher');
            break;
        case '3':
            await runJobSearch('Doctor');
            break;
        case '4':
            await runJobSearch('Nurse');
            break;
        case '5':
            await runJobSearch('Accountant');
            break;
        case '6':
            await runJobSearch('Marketing Manager');
            break;
        case '7':
            await runJobSearch('Sales Executive');
            break;
        case '8':
            await runJobSearch('Data Scientist');
            break;
        case '9':
            await runJobSearch('Graphic Designer');
            break;
        case '10':
            await runJobSearch('Engineer');
            break;
        case 'custom':
        case 'c':
            console.log('\n🔧 CUSTOM SEARCH:');
            
            jobType = await askQuestion('Enter job title (e.g. "Web Developer"): ');
            location = await askQuestion('Enter location (default: Pakistan): ') || 'Pakistan';
            const maxJobsInput = await askQuestion('Number of jobs (default: 8): ');
            maxJobs = parseInt(maxJobsInput) || 8;
            
            await runJobSearch(jobType, location, maxJobs);
            break;
        case 'exit':
        case 'x':
        case 'quit':
        case 'q':
            console.log('\n👋 Thanks for using Job Crawler! Goodbye!\n');
            process.exit(0);
            break;
        default:
            console.log('❌ Invalid choice. Please try again.\n');
            return false;
    }
    return true;
}

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function main() {
    while (true) {
        showMenu();
        
        const choice = await askQuestion('Choose an option (1-10, custom, or exit): ');
        console.log('');
        
        try {
            const success = await handleChoice(choice.toLowerCase());
            if (success) {
                console.log('\n✅ Search completed!\n');
                
                const continueSearch = await askQuestion('Do another search? (y/n): ');
                if (continueSearch.toLowerCase() !== 'y' && continueSearch.toLowerCase() !== 'yes') {
                    console.log('\n👋 Thanks for using Job Crawler! Goodbye!\n');
                    break;
                }
                console.log('\n');
            }
        } catch (error) {
            console.error('❌ Error:', error.message);
        }
    }
    
    rl.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
    console.log('\n\n👋 Thanks for using Job Crawler! Goodbye!\n');
    process.exit(0);
});

main();