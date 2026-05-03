# Job Crawler for Pakistan 🕷️

A comprehensive web crawler designed specifically for job searching across Pakistani job platforms including Indeed, Rozee.pk, and LinkedIn. Built with Node.js and Puppeteer for robust web scraping capabilities.

## Features ✨

- **Multi-Platform Support**: Crawls Indeed Pakistan, Rozee.pk, and LinkedIn (limited)
- **Smart Data Processing**: Removes duplicates, filters, and sorts job listings
- **Flexible Search Options**: Keyword, location, salary range, and date filtering
- **Multiple Export Formats**: JSON, CSV, and structured summaries
- **Robust Error Handling**: Retry mechanisms and comprehensive logging
- **Rate Limiting**: Respects website terms with configurable delays
- **Extensible Architecture**: Easy to add new job platforms

## Installation 📦

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn

### Quick Start

1. **Clone or download the project files**
   ```bash
   cd webcroller
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create necessary directories** (done automatically on first run)
   ```bash
   mkdir data logs
   ```

## Usage 🚀

### Basic Command Line Usage

```bash
# Basic search
npm start

# Search with custom keyword and location
npm start "web developer" "Karachi"

# Run examples
node examples/basic-usage.js
```

### Programmatic Usage

```javascript
import { JobCrawler } from './src/JobCrawler.js';
import { getConfig } from './config.js';

const config = getConfig();
const crawler = new JobCrawler(config.crawler);

// Basic search
const result = await crawler.searchJobs({
    keyword: 'software engineer',
    location: 'Pakistan',
    sources: ['indeed', 'rozee'],
    maxPages: 3
});

console.log(`Found ${result.summary.totalJobs} jobs`);
```

### Advanced Usage Examples

#### 1. Filtered Search
```javascript
const result = await crawler.searchJobs({
    keyword: 'javascript developer',
    location: 'Karachi',
    sources: ['indeed', 'rozee'],
    maxPages: 5,
    filters: {
        keywords: ['react', 'node.js'],
        minSalary: 50000,
        locations: ['Karachi', 'Lahore']
    },
    sortBy: 'datePosted'
});
```

#### 2. Single Platform Crawling
```javascript
const indeedJobs = await crawler.crawlSingle('indeed', {
    keyword: 'data scientist',
    location: 'Islamabad',
    maxPages: 3
});
```

#### 3. Custom Configuration
```javascript
const customConfig = getConfig({
    crawler: {
        headless: false,  // Show browser
        slowMo: 500,      // Slower execution
        timeout: 45000    // Longer timeout
    },
    sources: {
        linkedin: {
            enabled: true   // Enable LinkedIn (not recommended)
        }
    }
});

const crawler = new JobCrawler(customConfig.crawler);
```

## Configuration ⚙️

The `config.js` file contains all configurable options:

### Crawler Settings
- `headless`: Run browser in headless mode (default: true)
- `slowMo`: Delay between actions in milliseconds
- `timeout`: Page load timeout
- `maxRetries`: Number of retry attempts
- `concurrent`: Run multiple crawlers simultaneously

### Source Settings
- Enable/disable specific job platforms
- Custom delays for each platform
- Platform-specific configurations

### Filter Options
- Salary range filtering
- Keyword inclusion/exclusion
- Location filtering
- Company filtering

## Supported Platforms 🌐

### ✅ Indeed Pakistan (pk.indeed.com)
- **Status**: Fully supported
- **Features**: Job listings, company info, location, salary, descriptions
- **Reliability**: High
- **Rate Limiting**: 3-5 seconds between requests

### ✅ Rozee.pk
- **Status**: Supported with fallback extraction
- **Features**: Job listings, company info, salary (when available)
- **Reliability**: Good
- **Rate Limiting**: 4-6 seconds between requests

### ⚠️ LinkedIn
- **Status**: Limited support (experimental)
- **Features**: Basic job listings
- **Reliability**: Low (anti-bot measures)
- **Recommendation**: Use LinkedIn API for production
- **Note**: May require authentication, has strict rate limiting

## Output Formats 📄

### JSON Structure
```json
{
  "summary": {
    "totalJobs": 150,
    "sources": { "indeed": 80, "rozee": 70 },
    "topLocations": [["Karachi", 45], ["Lahore", 35]],
    "topCompanies": [["Company A", 10], ["Company B", 8]],
    "salaryRanges": {
      "avgSalary": 65000,
      "minSalary": 25000,
      "maxSalary": 150000
    }
  },
  "jobs": [
    {
      "title": "Software Engineer",
      "company": "Tech Company",
      "location": "Karachi",
      "salary": "50,000 - 80,000 PKR",
      "description": "Job description...",
      "url": "https://...",
      "source": "indeed",
      "datePosted": "2024-01-15T10:00:00.000Z",
      "extractedAt": "2024-01-15T12:00:00.000Z"
    }
  ]
}
```

### CSV Export
All job data is also saved in CSV format for easy analysis in Excel or other tools.

## File Structure 📁

```
webcroller/
├── src/
│   ├── BaseCrawler.js          # Base crawler class
│   ├── IndeedCrawler.js        # Indeed-specific crawler
│   ├── RozeeCrawler.js         # Rozee-specific crawler
│   ├── LinkedInCrawler.js      # LinkedIn crawler (limited)
│   ├── JobCrawler.js           # Main orchestrator
│   ├── JobDataProcessor.js     # Data processing utilities
│   └── index.js                # CLI interface
├── examples/
│   └── basic-usage.js          # Usage examples
├── data/                       # Output directory
├── logs/                       # Log files
├── config.js                   # Configuration
├── package.json
└── README.md
```

## Error Handling & Logging 📝

The crawler includes comprehensive error handling and logging:

- **Logs Location**: `logs/` directory
- **Log Levels**: info, warn, error
- **Per-Crawler Logs**: Separate logs for each platform
- **Retry Mechanism**: Automatic retries with exponential backoff
- **Graceful Failures**: Continues with other sources if one fails

## Limitations & Considerations ⚠️

### Technical Limitations
1. **Website Changes**: Job sites may update their structure, breaking selectors
2. **Rate Limiting**: Built-in delays to respect website terms
3. **IP Blocking**: Excessive requests may result in temporary blocks
4. **JavaScript Required**: Some sites require JavaScript execution (handled by Puppeteer)

### LinkedIn Specific
- **Anti-Bot Measures**: LinkedIn actively blocks automated access
- **Authentication Required**: May require login for full access  
- **Limited Success**: Success rate is low without authentication
- **API Alternative**: Consider LinkedIn Jobs API for production use

### Legal Considerations
- **Terms of Service**: Ensure compliance with each website's terms
- **Rate Limiting**: Respect robots.txt and rate limits
- **Data Usage**: Use scraped data responsibly and ethically
- **Commercial Use**: Review platform policies for commercial usage

## Troubleshooting 🔧

### Common Issues

1. **"No jobs found" error**
   - Check if the website structure has changed
   - Verify search parameters are valid
   - Try reducing maxPages or adding delays

2. **Browser launch fails**
   - Install missing browser dependencies
   - Try setting `headless: false` for debugging
   - Check system resources

3. **LinkedIn crawler fails**
   - This is expected due to anti-bot measures
   - Consider disabling LinkedIn in config
   - Use LinkedIn API for reliable access

4. **Slow performance**
   - Increase delays in config
   - Disable concurrent crawling
   - Reduce maxPages

### Debugging Tips

```javascript
// Enable visual debugging
const config = getConfig({
    crawler: {
        headless: false,
        slowMo: 1000
    }
});

// Test individual crawlers
await crawler.testCrawler('indeed');
```

## Integration with React Projects 🔗

To integrate this crawler into your existing Node.js/React project:

### 1. Backend Integration
```javascript
// In your Express.js route
import { JobCrawler } from './path/to/JobCrawler.js';

app.post('/api/search-jobs', async (req, res) => {
    const { keyword, location, sources } = req.body;
    
    const crawler = new JobCrawler();
    try {
        const result = await crawler.searchJobs({
            keyword,
            location,
            sources,
            maxPages: 3
        });
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

### 2. Frontend Integration
```javascript
// In your React component
const searchJobs = async (searchParams) => {
    const response = await fetch('/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchParams)
    });
    
    const jobs = await response.json();
    return jobs;
};
```

### 3. Background Jobs
For better performance, consider running crawlers as background jobs:

```javascript
// Using a job queue (e.g., Bull, Agenda)
import Queue from 'bull';

const jobQueue = new Queue('job crawling');

jobQueue.process(async (job) => {
    const { searchParams } = job.data;
    const crawler = new JobCrawler();
    return await crawler.searchJobs(searchParams);
});
```

## Contributing 🤝

### Adding New Job Platforms

1. Create a new crawler class extending `BaseCrawler`
2. Implement required methods: `buildSearchUrl()`, `extractJobData()`, `crawl()`
3. Add platform configuration to `config.js`
4. Update `JobCrawler.js` to include the new crawler
5. Test thoroughly and handle edge cases

### Code Structure
- Follow existing patterns and naming conventions
- Add comprehensive error handling
- Include logging for debugging
- Write clear documentation

## License 📜

MIT License - feel free to use this code for personal and commercial projects.

## Support 💬

For questions, issues, or contributions:
1. Check existing issues and documentation
2. Create detailed bug reports with logs
3. Include system information and configuration
4. Test with minimal examples when possible

---

**Happy Job Hunting! 🎯**

> Remember to use this tool responsibly and in compliance with each platform's terms of service. Always respect rate limits and consider using official APIs for production applications.