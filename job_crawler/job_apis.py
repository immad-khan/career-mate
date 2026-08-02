import os
import re
import logging
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape

import requests

logger = logging.getLogger(__name__)

ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID', '')
ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY', '')
JOOBLE_API_KEY = os.getenv('JOOBLE_API_KEY', '')


def _strip_html(text):
    if not text:
        return ''
    text = re.sub(r'<[^>]+>', ' ', text)
    text = unescape(text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text[:2000]


def _relative_date(date_str):
    if not date_str:
        return 'Recently'
    try:
        if isinstance(date_str, (int, float)):
            dt = datetime.fromtimestamp(date_str, tz=timezone.utc)
        elif 'T' in str(date_str):
            dt = datetime.fromisoformat(str(date_str).replace('Z', '+00:00'))
        else:
            return str(date_str)[:50]
        now = datetime.now(timezone.utc)
        diff = now - dt
        if diff.days == 0:
            hours = diff.seconds // 3600
            return f'{hours} hour{"s" if hours != 1 else ""} ago' if hours > 0 else 'Today'
        if diff.days == 1:
            return 'Yesterday'
        if diff.days < 7:
            return f'{diff.days} days ago'
        if diff.days < 30:
            weeks = diff.days // 7
            return f'{weeks} week{"s" if weeks != 1 else ""} ago'
        months = diff.days // 30
        return f'{months} month{"s" if months != 1 else ""} ago'
    except Exception:
        return str(date_str)[:50]


def _format_salary(min_val, max_val, currency='USD'):
    if not min_val and not max_val:
        return ''
    currency = currency or 'USD'
    parts = []
    if min_val:
        parts.append(f'{currency} {int(min_val):,}')
    if max_val:
        parts.append(f'{currency} {int(max_val):,}')
    return ' - '.join(parts) if parts else ''


def _safe_get(url, params=None, headers=None, timeout=15):
    try:
        resp = requests.get(url, params=params, headers=headers, timeout=timeout)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        logger.warning(f'API request failed for {url}: {e}')
        return None


# ============================================================
# Remotive (no auth, remote jobs)
# ============================================================

def fetch_remotive(keyword, location, max_results=20):
    data = _safe_get(
        'https://remotive.com/api/remote-jobs',
        params={'search': keyword, 'limit': max_results},
    )
    if not data:
        return []

    jobs_raw = data.get('jobs', [])
    results = []
    for job in jobs_raw:
        title = job.get('title', '')
        company = job.get('company_name', '')
        desc = _strip_html(job.get('description', ''))
        tags = job.get('tags', [])
        job_type = job.get('job_type', '').replace('-', ' ').title() or 'Full-time'
        salary_raw = job.get('salary', '')

        results.append({
            'id': f'remotive-{job.get("id", "")}',
            'site': 'Remotive',
            'job_url': job.get('url', ''),
            'title': title,
            'company': company,
            'location': job.get('candidate_required_location', 'Remote'),
            'date_posted': _relative_date(job.get('publication_date', '')),
            'salary': salary_raw or 'Not disclosed',
            'description': desc[:1500],
            'is_remote': True,
            'job_type': job_type,
            'tags': tags,
        })
    return results


# ============================================================
# RemoteOK (no auth, remote jobs)
# ============================================================

def fetch_remoteok(keyword, location, max_results=20):
    data = _safe_get('https://remoteok.com/api', timeout=20)
    if not data or not isinstance(data, list):
        return []

    results = []
    keyword_lower = keyword.lower()

    for job in data:
        if not isinstance(job, dict) or 'id' not in job:
            continue

        title = job.get('position', '')
        company = job.get('company', '')
        tags = job.get('tags', [])
        desc = _strip_html(job.get('description', ''))

        searchable = f'{title} {company} {" ".join(tags)} {desc}'.lower()
        if keyword_lower not in searchable:
            continue

        salary_min = job.get('salary_min', 0)
        salary_max = job.get('salary_max', 0)

        results.append({
            'id': f'remoteok-{job.get("id", "")}',
            'site': 'RemoteOK',
            'job_url': job.get('apply_url') or job.get('url', ''),
            'title': title,
            'company': company,
            'location': job.get('location', 'Remote'),
            'date_posted': _relative_date(job.get('date', '') or job.get('epoch', 0)),
            'salary': _format_salary(salary_min, salary_max) or 'Not disclosed',
            'description': desc[:1500],
            'is_remote': True,
            'job_type': 'Remote',
            'tags': tags[:10],
        })

        if len(results) >= max_results:
            break
    return results


# ============================================================
# Himalayas (no auth, 93K+ jobs)
# ============================================================

def fetch_himalayas(keyword, location, max_results=20):
    params = {
        'search': keyword,
        'limit': min(max_results, 50),
    }

    data = _safe_get('https://himalayas.app/jobs/api', params=params, timeout=20)
    if not data:
        return []

    jobs_raw = data.get('jobs', [])
    results = []
    for job in jobs_raw:
        title = job.get('title', '')
        company = job.get('companyName', '')
        desc = _strip_html(job.get('description', ''))
        emp_type = job.get('employmentType', 'Full-time') or 'Full-time'
        min_sal = job.get('minSalary')
        max_sal = job.get('maxSalary')
        currency = job.get('currency', 'USD')
        locations = job.get('locationRestrictions', [])
        loc_str = ', '.join(locations[:3]) if locations else 'Worldwide'

        results.append({
            'id': f'himalayas-{job.get("guid", job.get("title", ""))[:100]}',
            'site': 'Himalayas',
            'job_url': job.get('applicationLink', ''),
            'title': title,
            'company': company,
            'location': loc_str,
            'date_posted': _relative_date(job.get('pubDate', 0)),
            'salary': _format_salary(min_sal, max_sal, currency) or 'Not disclosed',
            'description': desc[:1500],
            'is_remote': 'remote' in loc_str.lower() or 'worldwide' in loc_str.lower(),
            'job_type': emp_type,
            'tags': job.get('categories', [])[:10],
        })
    return results


# ============================================================
# Adzuna (free key required, good Pakistan coverage)
# ============================================================

ADZUNA_COUNTRY_MAP = {
    'pakistan': 'pk', 'pk': 'pk',
    'united kingdom': 'gb', 'uk': 'gb', 'gb': 'gb',
    'united states': 'us', 'usa': 'us', 'us': 'us',
    'india': 'in', 'in': 'in',
    'germany': 'de', 'de': 'de',
    'canada': 'ca', 'ca': 'ca',
    'australia': 'au', 'au': 'au',
}


def fetch_adzuna(keyword, location, max_results=20):
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        return []

    country_code = 'pk'
    location_lower = location.lower().strip()
    for key, code in ADZUNA_COUNTRY_MAP.items():
        if key in location_lower:
            country_code = code
            break

    url = f'https://api.adzuna.com/v1/api/jobs/{country_code}/search/1'
    params = {
        'app_id': ADZUNA_APP_ID,
        'app_key': ADZUNA_APP_KEY,
        'what': keyword,
        'results_per_page': min(max_results, 50),
        'content-type': 'application/json',
    }
    if location_lower and location_lower not in ('pakistan', 'pk', 'all', ''):
        clean_loc = location_lower.replace('pakistan', '').strip(', ')
        if clean_loc:
            params['where'] = clean_loc

    data = _safe_get(url, params=params)
    if not data:
        return []

    jobs_raw = data.get('results', [])
    results = []
    for job in jobs_raw:
        desc = _strip_html(job.get('description', ''))
        loc = job.get('location', {})
        display_name = loc.get('display_name', '') if isinstance(loc, dict) else str(loc)
        company_data = job.get('company', {})
        company_name = company_data.get('display_name', '') if isinstance(company_data, dict) else str(company_data)

        results.append({
            'id': f'adzuna-{job.get("id", "")}',
            'site': 'Adzuna',
            'job_url': job.get('redirect_url', ''),
            'title': job.get('title', ''),
            'company': company_name,
            'location': display_name,
            'date_posted': _relative_date(job.get('created', '')),
            'salary': _format_salary(job.get('salary_min'), job.get('salary_max'), 'PKR' if country_code == 'pk' else 'USD') or 'Not disclosed',
            'description': desc[:1500],
            'is_remote': 'remote' in display_name.lower(),
            'job_type': 'Full-time',
            'tags': [],
        })
    return results


# ============================================================
# Jooble (free key required, good Pakistan coverage)
# ============================================================

def fetch_jooble(keyword, location, max_results=20):
    if not JOOBLE_API_KEY:
        return []

    url = f'https://jooble.org/api/{JOOBLE_API_KEY}'
    payload = {
        'keywords': keyword,
        'location': location,
        'ResultOnPage': str(min(max_results, 50)),
        'page': '1',
    }

    try:
        resp = requests.post(url, json=payload, timeout=20)
        resp.raise_for_status()
        data = resp.json()
    except Exception as e:
        logger.warning(f'Jooble API error: {e}')
        return []

    jobs_raw = data.get('jobs', [])
    results = []
    for job in jobs_raw:
        desc = _strip_html(job.get('snippet', ''))
        results.append({
            'id': f'jooble-{job.get("id", "")}',
            'site': 'Jooble',
            'job_url': job.get('link', ''),
            'title': job.get('title', ''),
            'company': job.get('company', 'Unknown'),
            'location': job.get('location', ''),
            'date_posted': _relative_date(job.get('updated', '')),
            'salary': job.get('salary', 'Not disclosed') or 'Not disclosed',
            'description': desc[:1500],
            'is_remote': 'remote' in job.get('title', '').lower() or 'remote' in job.get('location', '').lower(),
            'job_type': job.get('type', 'Full-time') or 'Full-time',
            'tags': [],
        })
    return results


# ============================================================
# Combined fetcher (runs all 5 in parallel)
# ============================================================

def _is_relevant(job, keyword_words):
    """Return True if the job title or description contains at least one keyword word."""
    title = (job.get('title') or '').lower()
    description = (job.get('description') or '').lower()
    tags = ' '.join(job.get('tags') or []).lower()
    searchable = f'{title} {description} {tags}'
    return any(word in searchable for word in keyword_words)


def fetch_all_apis(keyword, location, max_per_api=15):
    all_jobs = []

    # Split keyword into individual words for relevance matching
    keyword_words = [w.lower() for w in keyword.split() if len(w) > 2]
    if not keyword_words:
        keyword_words = [keyword.lower()]

    fetchers = [
        ('Remotive', lambda: fetch_remotive(keyword, location, max_per_api)),
        ('RemoteOK', lambda: fetch_remoteok(keyword, location, max_per_api)),
        ('Himalayas', lambda: fetch_himalayas(keyword, location, max_per_api)),
        ('Adzuna', lambda: fetch_adzuna(keyword, location, max_per_api)),
        ('Jooble', lambda: fetch_jooble(keyword, location, max_per_api)),
    ]

    with ThreadPoolExecutor(max_workers=5) as executor:
        future_to_name = {executor.submit(fn): name for name, fn in fetchers}
        for future in as_completed(future_to_name):
            name = future_to_name[future]
            try:
                jobs = future.result()
                all_jobs.extend(jobs)
                logger.info(f'{name} returned {len(jobs)} jobs')
            except Exception as e:
                logger.error(f'{name} fetch failed: {e}')

    # Filter to only relevant jobs
    relevant_jobs = [job for job in all_jobs if _is_relevant(job, keyword_words)]
    logger.info(f'Relevance filter: {len(all_jobs)} -> {len(relevant_jobs)} jobs for keyword "{keyword}"')

    # Deduplicate by (title, company)
    seen = set()
    deduped = []
    for job in relevant_jobs:
        key = (job['title'].lower().strip(), job['company'].lower().strip())
        if key not in seen:
            seen.add(key)
            deduped.append(job)

    return deduped
