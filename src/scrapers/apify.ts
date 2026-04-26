import { ApifyClient } from 'apify-client';
import { createHash } from 'crypto';
import 'dotenv/config';

const apify = new ApifyClient({ token: process.env.APIFY_TOKEN });

export interface ScrapeResult {
  source_type: 'pricing' | 'changelog' | 'jobs' | 'news';
  url: string;
  content: string;
  content_hash: string;
  scraped_at: number;
}

/**
 * Generic web scrape via Apify's Website Content Crawler.
 * Used for pricing pages and changelogs — anything where we want clean text
 * from a single URL.
 */
export async function scrapePage(
  url: string,
  source_type: 'pricing' | 'changelog'
): Promise<ScrapeResult> {
  const run = await apify.actor('apify/website-content-crawler').call({
    startUrls: [{ url }],
    maxCrawlPages: 1,
    crawlerType: 'playwright:adaptive',
    saveMarkdown: true,
  });

  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  const text = (items[0]?.markdown as string) ?? (items[0]?.text as string) ?? '';

  return {
    source_type,
    url,
    content: text,
    content_hash: hash(text),
    scraped_at: Date.now(),
  };
}

/**
 * Scrape job postings via Apify's Indeed/LinkedIn scrapers.
 * Hiring signals are gold — "5 ML engineers at competitor" predicts strategy.
 */
export async function scrapeJobs(
  companyName: string,
  jobsUrl?: string
): Promise<ScrapeResult> {
  // For hackathon: use Google for jobs site:linkedin.com/jobs/ "{company}"
  // Real impl swaps to Apify's Indeed Scraper or LinkedIn Jobs Scraper.
  const run = await apify.actor('apify/google-search-scraper').call({
    queries: `site:linkedin.com/jobs "${companyName}"`,
    resultsPerPage: 10,
    maxPagesPerQuery: 1,
  });

  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  const content = JSON.stringify(
    items.map((i: any) => ({
      title: i.title,
      url: i.url,
      description: i.description,
    })),
    null,
    2
  );

  return {
    source_type: 'jobs',
    url: jobsUrl ?? `linkedin.com/jobs/${companyName}`,
    content,
    content_hash: hash(content),
    scraped_at: Date.now(),
  };
}

/**
 * News mentions via Google Search Scraper.
 * Funding, partnerships, executive changes, press coverage.
 */
export async function scrapeNews(companyName: string): Promise<ScrapeResult> {
  const run = await apify.actor('apify/google-search-scraper').call({
    queries: `"${companyName}" (raised OR launched OR partnership OR acquires)`,
    resultsPerPage: 10,
    maxPagesPerQuery: 1,
  });

  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  const content = JSON.stringify(
    items.map((i: any) => ({
      title: i.title,
      url: i.url,
      description: i.description,
      date: i.date,
    })),
    null,
    2
  );

  return {
    source_type: 'news',
    url: `google.com/search?q=${encodeURIComponent(companyName)}`,
    content,
    content_hash: hash(content),
    scraped_at: Date.now(),
  };
}

function hash(s: string): string {
  return createHash('sha256').update(s).digest('hex').slice(0, 16);
}
