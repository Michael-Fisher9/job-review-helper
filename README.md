# Job Review Helper

A Chrome extension that opens Glassdoor or Indeed reviews for the company on the job posting you're looking at, in a small window over the page. I built it while applying for jobs, after one too many rounds of copying a company name into another tab.

It works on Handshake, LinkedIn, Indeed and most job boards with a recognizable company field. Highlight a name to search for that instead.

## Install

1. Clone or download this repository.
2. In Chrome, go to `chrome://extensions/` and turn on Developer mode.
3. Click "Load unpacked" and pick this folder.

## Use

1. Open a job posting.
2. Click the extension icon and pick Glassdoor or Indeed.
3. Reviews open in a window you can drag and resize. If it can't find the company name, it asks.

## How it finds the company

With nothing highlighted, it tries a list of selectors, most specific first, and takes the first that returns a name:

- **Handshake:** links whose `aria-label` names a company (Inc., LLC and so on), then links to employer pages (`a[href*="/employer/"]`), then a selector tied to Handshake's current layout.
- **LinkedIn:** `.jobs-unified-top-card__company-name a`, `.topcard__org-name-link`
- **Indeed:** `div[data-company-name]`, `.jobsearch-CompanyInfoWithoutHeaderImage .jobsearch-CompanyReview--name`
- **Anything else:** `.company-name`, `.employer-name`, `.job-company`, then `div[class*="company"] a` and `a[href*="/company/"]`

The search goes through each review site's own search page rather than building a URL to the company's page, because company slugs on both sites are inconsistent ("Acme Corp" vs "acme-corporation") and their search handles that better.

Handshake's last fallback uses a generated class name (`.sc-eZMCpr`) that will break the next time they rebuild the site. When it does, the aria-label and employer-link checks usually still catch it.

## Permissions

- `activeTab`, `scripting`: read the company name from the page you're on
- `storage`: remember which review site you picked
- `tabs`: open the review window

The only thing that leaves your browser is the company name, sent to the review site you picked. See [PRIVACY.md](PRIVACY.md).

## Changing it

Edit the files, then hit the reload icon on the extension's card in `chrome://extensions/`.

MIT licensed. By [Michael Fisher](https://github.com/Michael-Fisher9).
