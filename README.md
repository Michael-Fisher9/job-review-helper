# Job Review Helper

A Chrome extension that helps you view company reviews from Glassdoor or Indeed while browsing job postings. Perfect for quickly researching companies during your job search.

![Version](https://img.shields.io/badge/version-1.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
[![GitHub](https://img.shields.io/badge/github-mandrewf/job--review--helper-blue)](https://github.com/Mandrewf/job-review-helper)

## Features

- **Dual Review Sources**: Choose between Glassdoor or Indeed for company reviews
- **Flexible Search**: Use highlighted text for your search, or let the extension auto-detect the company name.
- **Smart Company Detection**: Automatically finds company names on job postings using common selectors.
- **Reliable Results**: Uses the site's own search function to find reviews, improving accuracy.
- **Floating Popup**: Opens reviews in a draggable, resizable popup window
- **Works on Multiple Sites**: Compatible with Handshake, LinkedIn, and other job platforms

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in the top-right corner)
4. Click "Load unpacked" and select the extension directory

## Usage

1. Navigate to any job posting page (e.g., Handshake, LinkedIn)
2. Click the extension icon in your browser toolbar
3. Select your preferred review source (Glassdoor or Indeed)
4. If company detection fails, you'll be prompted to enter the company name
5. The reviews will open in a floating popup window

### Auto-Detection Logic

When no text is highlighted, the extension uses a multi-layered approach to detect company names:

#### For Handshake
The extension uses a specialized detection algorithm for Handshake that tries multiple approaches in order:

1. **Aria-label detection**: Looks for links with `aria-label` attributes containing company identifiers (Inc., LLC, etc.)
2. **Employer links**: Searches for links to employer pages (`a[href*="/employer/"]`) and extracts the company name
3. **Specific selectors**: Uses precise CSS selectors like `a[href*="/e/"] > .sc-eZMCpr` based on Handshake's DOM structure

#### For Other Sites
- **LinkedIn**: `.jobs-unified-top-card__company-name a`, `.topcard__org-name-link`
- **Indeed**: `div[data-company-name]`, `.jobsearch-CompanyInfoWithoutHeaderImage .jobsearch-CompanyReview--name`
- **General**: `.company-name`, `.employer-name`, `.job-company`
- **Fallback**: `div[class*="company"] a`, `a[href*="/company/"]`

## Permissions

- `activeTab`: Access the current tab to detect company names
- `scripting`: Inject scripts to interact with web pages
- `storage`: Save your preferences (review source, auto-detect settings)
- `tabs`: Manage browser tabs and windows

## Development

To modify the extension:

1. Make your changes to the source files
2. In Chrome, go to `chrome://extensions/`
3. Find the extension and click the refresh icon to reload it

## License

MIT License - See [LICENSE](LICENSE) file for details.

## Author

[Michael Fisher](https://github.com/Mandrewf)
