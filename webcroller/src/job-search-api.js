import express from 'express';
import cors from 'cors';
import RealtimeJobCrawler from './realtime-job-crawler.js';
import fs from 'fs-extra';

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize job crawler
let jobCrawler = null;

// Initialize crawler on startup
async function initializeCrawler() {
    try {
        console.log('🚀 Starting Job Search API Server...');
        jobCrawler = new RealtimeJobCrawler();
        await jobCrawler.initialize();
        console.log('✅ Job Crawler initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize job crawler:', error.message);
        process.exit(1);
    }
}

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'Real-time Job Search API',
        version: '1.0.0',
        features: [
            'Multi-platform job search',
            'Real-time crawling',
            'Anti-detection measures',
            'Indeed, LinkedIn, Glassdoor, Rozee, Mustakbil'
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
            {
                name: 'indeed',
                displayName: 'Indeed',
                url: 'https://www.indeed.com',
                regions: ['Global'],
                features: ['salary', 'company_reviews', 'job_alerts']
            },
            {
                name: 'glassdoor',
                displayName: 'Glassdoor',
                url: 'https://www.glassdoor.com',
                regions: ['Global'],
                features: ['salary', 'company_reviews', 'interview_reviews']
            },
            {
                name: 'linkedin',
                displayName: 'LinkedIn Jobs',
                url: 'https://www.linkedin.com/jobs',
                regions: ['Global'],
                features: ['professional_network', 'easy_apply', 'company_insights']
            },
            {
                name: 'rozee',
                displayName: 'Rozee.pk',
                url: 'https://www.rozee.pk',
                regions: ['Pakistan'],
                features: ['local_jobs', 'salary', 'career_advice']
            },
            {
                name: 'mustakbil',
                displayName: 'Mustakbil',
                url: 'https://www.mustakbil.com',
                regions: ['Pakistan'],
                features: ['local_jobs', 'career_guidance']
            }
        ]
    });
});

// Main job search endpoint
app.post('/search-jobs', async (req, res) => {
    try {
        console.log('📥 Received job search request');

        const { query, location, maxResults = 50, sources = 'all' } = req.body;

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

        // Start the search
        const startTime = Date.now();

        const jobs = await jobCrawler.searchJobs(query, location, maxResults);

        const searchTime = Date.now() - startTime;

        // Group jobs by source for analytics
        const jobsBySource = jobs.reduce((acc, job) => {
            acc[job.source] = (acc[job.source] || 0) + 1;
            return acc;
        }, {});

        // Save search results for analytics (optional)
        const searchLog = {
            timestamp: new Date().toISOString(),
            query,
            location,
            resultsCount: jobs.length,
            searchTime,
            jobsBySource
        };

        // Log the search (optional - save to file for analytics)
        try {
            const logFile = './logs/search-log.json';
            await fs.ensureFile(logFile);
            const existingLogs = await fs.readJson(logFile).catch(() => []);
            existingLogs.push(searchLog);
            await fs.writeJson(logFile, existingLogs.slice(-1000)); // Keep last 1000 searches
        } catch (logError) {
            console.log('Warning: Could not save search log:', logError.message);
        }

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
                requirements: job.requirements,
                deadline: job.deadline,
                jobUrl: job.jobUrl,
                source: job.source,
                companyLogo: job.companyLogo,
                foundAt: job.foundAt,
                searchQuery: job.searchQuery,
                searchLocation: job.searchLocation
            }))
        });

    } catch (error) {
        console.error('❌ Job search failed:', error.message);
        console.error(error.stack);

        res.status(500).json({
            error: 'Job search failed',
            message: error.message,
            suggestion: 'Please try again with different search terms or check your internet connection'
        });
    }
});

// Endpoint to get job details (for when user clicks on a specific job)
app.get('/job-details/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;

        // In a real implementation, you might store job details in a database
        // For now, return a message to fetch from the original URL
        res.json({
            message: 'Job details available at the original job URL',
            suggestion: 'Click on the job URL to view full details on the original platform',
            jobId
        });

    } catch (error) {
        res.status(500).json({
            error: 'Failed to get job details',
            message: error.message
        });
    }
});

// Search statistics endpoint
app.get('/search-stats', async (req, res) => {
    try {
        const logFile = './logs/search-log.json';
        const logs = await fs.readJson(logFile).catch(() => []);

        const stats = {
            totalSearches: logs.length,
            recentSearches: logs.slice(-10),
            popularQueries: {},
            popularLocations: {},
            averageSearchTime: 0,
            sourceStats: {}
        };

        // Calculate statistics
        logs.forEach(log => {
            // Popular queries
            stats.popularQueries[log.query] = (stats.popularQueries[log.query] || 0) + 1;

            // Popular locations
            stats.popularLocations[log.location] = (stats.popularLocations[log.location] || 0) + 1;

            // Source statistics
            Object.entries(log.jobsBySource || {}).forEach(([source, count]) => {
                stats.sourceStats[source] = (stats.sourceStats[source] || 0) + count;
            });
        });

        // Calculate average search time
        if (logs.length > 0) {
            stats.averageSearchTime = logs.reduce((sum, log) => sum + (log.searchTime || 0), 0) / logs.length;
        }

        res.json(stats);

    } catch (error) {
        res.status(500).json({
            error: 'Failed to get search statistics',
            message: error.message
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
            'GET /supported-sources',
            'GET /job-details/:jobId',
            'GET /search-stats'
        ]
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🔄 Gracefully shutting down...');
    if (jobCrawler) {
        await jobCrawler.close();
    }
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🔄 Gracefully shutting down...');
    if (jobCrawler) {
        await jobCrawler.close();
    }
    process.exit(0);
});

// Start the server
async function startServer() {
    try {
        await initializeCrawler();

        app.listen(PORT, () => {
            console.log(`\n🚀 Job Search API Server running on port ${PORT}`);
            console.log(`📍 Health check: http://localhost:${PORT}`);
            console.log(`🔍 Search endpoint: http://localhost:${PORT}/search-jobs`);
            console.log(`📊 Supported sources: http://localhost:${PORT}/supported-sources`);
            console.log('');
            console.log('📋 API Usage:');
            console.log('POST /search-jobs');
            console.log('Body: { "query": "Software Engineer", "location": "New York", "maxResults": 50 }');
            console.log('');
            console.log('🛡️ Features:');
            console.log('✅ Real-time job crawling');
            console.log('✅ Anti-detection measures');
            console.log('✅ Multiple job sources');
            console.log('✅ Duplicate removal');
            console.log('✅ Search analytics');
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

export default app;