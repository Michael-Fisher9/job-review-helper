// Store the current popup window ID
let popupWindowId = null;

// Function to extract company name from the current page
async function extractCompanyName(tabId) {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => {
        // 1. Prioritize user-highlighted text
        const selection = window.getSelection().toString().trim();
        if (selection) {
          return selection;
        }

        // 2. Try to detect a company name on job sites using common selectors
        
        // First, try Handshake-specific detection with the most robust methods
        if (window.location.hostname.includes('handshake')) {
          // Try aria-label approach first (most reliable)
          const companyLinks = document.querySelectorAll('a[aria-label]');
          for (const link of companyLinks) {
            const label = link.getAttribute('aria-label');
            // Look for company names that end with "Inc.", "LLC", etc.
            if (label && /Inc\.|LLC|Corp\.|Corporation|Company/.test(label)) {
              return label.replace(/\s+/g, ' ').trim();
            }
          }
          
          // Try employer links
          const employerLinks = document.querySelectorAll('a[href*="/employer/"]');
          for (const link of employerLinks) {
            // Get text from the link or its children
            const text = link.innerText.trim();
            if (text && text.length > 2) {
              return text.replace(/\s+/g, ' ').trim();
            }
            
            // If no text, try to extract from the URL
            const href = link.getAttribute('href');
            if (href) {
              const match = href.match(/\/employer\/([^\/]+)/);
              if (match && match[1]) {
                // Convert slug to readable name (replace dashes with spaces, capitalize words)
                return match[1].replace(/-/g, ' ')
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(' ');
              }
            }
          }
          
          // Try specific Handshake selectors
          const handshakeSelectors = [
            'a[href*="/e/"] > .sc-eZMCpr',  // Based on the screenshot
            '#skip-to-content > div > div:nth-child(1) > a > h1', // Another Handshake page type
            'div[data-testid="employer-name"]',
            '.style__employer-name___2_2gB',
            '.style__employer-name___3P69S'
          ];
          
          for (const selector of handshakeSelectors) {
            const el = document.querySelector(selector);
            if (el) {
              const text = el.innerText.trim();
              if (text && text.length > 2) {
                return text.replace(/\s+/g, ' ').trim();
              }
            }
          }
        }
        
        // General selectors for all sites
        const selectors = [
          // LinkedIn
          '.jobs-unified-top-card__company-name a',
          '.topcard__org-name-link',

          // Indeed
          'div[data-company-name]',
          '.jobsearch-CompanyInfoWithoutHeaderImage .jobsearch-CompanyReview--name',

          // General
          '.company-name',
          '.employer-name',
          '.job-company',
          'div[class*="company"] a',
          'a[href*="/company/"]'
        ];
        
        for (const selector of selectors) {
          const el = document.querySelector(selector);
          if (el) {
            const text = el.innerText.trim();
            if (text && text.length > 2 && !/^[0-9]+$/.test(text)) {
              return text.replace(/\s+/g, ' ').trim();
            }
          }
        }
        
        return null;
      }
    });
    
    return result?.result || null;
  } catch (error) {
    console.error('Error extracting company name:', error);
    return null;
  }
}

// Function to open review popup
async function openReviewPopup(companyName, source, tab) {
  // Clean up any existing popup
  if (popupWindowId) {
    try {
      await chrome.windows.remove(popupWindowId);
    } catch (e) {
      console.log('No existing popup to close');
    }
    popupWindowId = null;
  }

  // Create a loading popup first
  const loadingPopup = await chrome.windows.create({
    url: 'loading.html',
    type: 'popup',
    width: 400,
    height: 300
  });

  // Store the loading popup ID
  const loadingPopupId = loadingPopup.id;

  // Create the review URL based on the source
  let url;
  const encodedCompany = encodeURIComponent(companyName);
  
  if (source === 'indeed') {
    // Use Indeed's company search function for better reliability
    url = `https://www.indeed.com/companies/search?q=${encodedCompany}`;
  } else { // Default to Glassdoor
    // Use Glassdoor's search function
    url = `https://www.glassdoor.com/Search/results.htm?keyword=${encodedCompany}`;
  }

  try {
    // Create a new window for the popup
    const popup = await chrome.windows.create({
      url,
      type: 'popup',
      width: 600,
      height: 800,
      top: 100,
      left: 100,
      focused: true
    });
    
    // Close the loading popup
    try {
      await chrome.windows.remove(loadingPopupId);
    } catch (e) {
      console.log('Loading popup already closed');
    }
    
    popupWindowId = popup.id;
    
    // Make the window draggable (this is a simplified approach)
    // In a production app, you'd want to use the chrome.windows.update API
    // to implement proper dragging
    
  } catch (error) {
    console.error('Error creating popup:', error);
    // Fallback to opening in a new tab if popup fails
    chrome.tabs.create({ url });
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'showReviews') {
    (async () => {
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        const currentTab = tabs[0];
        
        let companyName = '';
        
        if (request.autoDetect) {
          companyName = await extractCompanyName(currentTab.id);
        }
        
        if (!companyName) {
          // If auto-detect failed or is disabled, prompt the user
          const result = await chrome.scripting.executeScript({
            target: { tabId: currentTab.id },
            func: () => prompt('Enter company name:')
          });
          
          companyName = result?.[0]?.result;
        }
        
        if (companyName) {
          await openReviewPopup(companyName, request.source, currentTab);
        } else {
          console.log('No company name provided');
        }
      } catch (error) {
        console.error('Error showing reviews:', error);
      }
    })();
    
    // Return true to indicate we'll send a response asynchronously
    return true;
  }
});

// Clean up when the popup is closed
chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === popupWindowId) {
    popupWindowId = null;
  }
});