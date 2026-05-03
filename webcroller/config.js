export const config = {
    crawler: {
        headless: true,
        slowMo: 100,
        timeout: 30000,
        maxRetries: 3,
        delay: 2000,
        concurrent: false
    },
    
    search: {
        defaultLocation: 'Pakistan',
        defaultMaxPages: 3,
        defaultSources: ['indeed', 'rozee']
    },
    
    sources: {
        indeed: {
            enabled: true,
            baseUrl: 'https://pk.indeed.com',
            maxPages: 5,
            delay: 3000
        },
        rozee: {
            enabled: true,
            baseUrl: 'https://www.rozee.pk',
            maxPages: 5,
            delay: 4000
        },
        linkedin: {
            enabled: false,
            baseUrl: 'https://www.linkedin.com',
            maxPages: 3,
            delay: 8000,
            warning: 'LinkedIn has strict anti-bot measures. May require authentication.'
        }
    },
    
    filters: {
        minSalary: null,
        maxSalary: null,
        keywords: [],
        locations: [],
        companies: [],
        excludeKeywords: []
    },
    
    output: {
        format: 'json', // json, csv, both
        saveDirectory: './data',
        logDirectory: './logs',
        includeDescription: true,
        maxDescriptionLength: 500
    },
    
    common: {
        jobTypes: {
            'full-time': 'Full Time',
            'part-time': 'Part Time',
            'contract': 'Contract',
            'temporary': 'Temporary',
            'internship': 'Internship',
            'volunteer': 'Volunteer'
        },
        
        experienceLevels: {
            'entry': 'Entry Level',
            'mid': 'Mid Level',
            'senior': 'Senior Level',
            'executive': 'Executive Level'
        },
        
        dateRanges: {
            '1': 'Past 24 hours',
            '3': 'Past 3 days',
            '7': 'Past week',
            '14': 'Past 2 weeks',
            '30': 'Past month'
        },
        
        commonLocations: [
            'Karachi',
            'Lahore',
            'Islamabad',
            'Rawalpindi',
            'Faisalabad',
            'Multan',
            'Peshawar',
            'Quetta',
            'Hyderabad',
            'Sialkot'
        ],
        
        popularKeywords: [
            'software engineer',
            'web developer',
            'data scientist',
            'project manager',
            'marketing',
            'sales',
            'accountant',
            'hr manager',
            'graphic designer',
            'content writer'
        ]
    }
};

export const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
];

export function getConfig(overrides = {}) {
    return {
        ...config,
        ...overrides,
        crawler: {
            ...config.crawler,
            ...overrides.crawler
        },
        search: {
            ...config.search,
            ...overrides.search
        },
        sources: {
            ...config.sources,
            ...overrides.sources
        },
        filters: {
            ...config.filters,
            ...overrides.filters
        },
        output: {
            ...config.output,
            ...overrides.output
        }
    };
}