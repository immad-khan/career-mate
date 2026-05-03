import express from 'express';
import cors from 'cors';
import { JobCrawler } from './JobCrawler.js';
import fs from 'fs-extra';

const app = express();
const PORT = process.env.PORT || 8081;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Real-time Job Search API',
        version: '2.0.0',
        features: [
            'Multi-platform job search',
            'Real-time crawling via Puppeteer',
            'Anti-detection measures',
            'Indeed, LinkedIn, Rozee'
        ],
        endpoints: {
            'GET /': 'Health check',
            'POST /search-jobs': 'Search jobs across platforms',
            'GET /supported-sources': 'Get list of supported job sources'
        }
    });
});

// Get supported job sources
app.get('/supported-sources', (req, res) => {
    res.json({
        sources: [
            { name: 'indeed', displayName: 'Indeed Pakistan', url: 'https://pk.indeed.com' },
            { name: 'rozee', displayName: 'Rozee.pk', url: 'https://www.rozee.pk' },
            { name: 'linkedin', displayName: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs' }
        ]
    });
});

// Main job search endpoint
app.post('/search-jobs', async (req, res) => {
    try {
        console.log('📥 Received job search request');

        const { query, location, maxResults = 30, sources = ['indeed', 'rozee'] } = req.body;

        // Validate input
        if (!query || !location) {
            return res.status(400).json({
                error: 'Missing required parameters',
                required: ['query', 'location'],
                received: req.body
            });
        }

        if (query.trim().length < 2) {
            return res.status(400).json({
                error: 'Query must be at least 2 characters long'
            });
        }

        console.log(`🔍 Searching for "${query}" in "${location}" (max: ${maxResults} results)`);

        const startTime = Date.now();

        // Use the proper JobCrawler with BaseCrawler (which has executablePath set)
        const crawler = new JobCrawler({
            headless: true,
            maxRetries: 2,
            timeout: 30000,
            concurrent: false
        });

        const searchParams = {
            keyword: query,
            location: location,
            sources: Array.isArray(sources) ? sources : ['indeed', 'rozee'],
            maxPages: 2,
            filters: {},
            sortBy: 'datePosted',
            saveResults: false
        };

        const result = await crawler.searchJobs(searchParams);

        const searchTime = Date.now() - startTime;

        // Map the jobs to the expected format
        const jobs = (result.jobs || []).slice(0, maxResults);

        // Group jobs by source for analytics
        const jobsBySource = jobs.reduce((acc, job) => {
            acc[job.source] = (acc[job.source] || 0) + 1;
            return acc;
        }, {});

        console.log(`✅ Search completed in ${searchTime}ms - Found ${jobs.length} jobs`);

        res.json({
            success: true,
            query,
            location,
            totalResults: jobs.length,
            searchTimeMs: searchTime,
            jobsBySource,
            jobs: jobs.map(job => ({
                id: `${job.source}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                title: job.title,
                company: job.company,
                location: job.location,
                salary: job.salary,
                description: job.description?.substring(0, 500) + (job.description?.length > 500 ? '...' : ''),
                jobUrl: job.url,
                source: job.source,
                foundAt: job.extractedAt || new Date().toISOString()
            }))
        });

    } catch (error) {
        console.error('❌ Job search failed:', error.message);

        res.status(500).json({
            error: 'Job search failed',
            message: error.message,
            suggestion: 'Please try again with different search terms or check your internet connection'
        });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({
        error: 'Internal server error',
        message: error.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Endpoint not found',
        availableEndpoints: [
            'GET /',
            'POST /search-jobs',
            'GET /supported-sources'
        ]
    });
});

// Start the server
async function startServer() {
    try {
        await fs.ensureDir('data');
        await fs.ensureDir('logs');

        app.listen(PORT, () => {
            console.log(`\n🚀 Job Search API Server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}`);
            console.log(`🔍 Search endpoint: http://localhost:${PORT}/search-jobs`);
            console.log('');
            console.log('📋 API Usage:');
            console.log('POST /search-jobs');
            console.log('Body: { "query": "Software Engineer", "location": "Pakistan", "maxResults": 30 }');
            console.log('');
            console.log('🛡️ Using JobCrawler with BaseCrawler (Puppeteer + explicit Chrome path)');
            console.log('✅ Ready to accept requests!');
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down...');
    process.exit(0);
});

startServer();

export default app;