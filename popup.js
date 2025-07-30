document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  chrome.storage.sync.get({
    reviewSource: 'glassdoor',  // Default to Glassdoor
    autoDetect: true
  }, function(items) {
    document.getElementById('reviewSource').value = items.reviewSource;
    document.getElementById('autoDetect').checked = items.autoDetect;
  });

  // Save settings when changed
  document.getElementById('reviewSource').addEventListener('change', saveSettings);
  document.getElementById('autoDetect').addEventListener('change', saveSettings);

  // Handle show reviews button click
  document.getElementById('showReviews').addEventListener('click', function() {
    const reviewSource = document.getElementById('reviewSource').value;
    const autoDetect = document.getElementById('autoDetect').checked;
    
    // Show loading indicator
    const button = document.getElementById('showReviews');
    button.classList.add('loading');
    button.textContent = 'Searching...';
    button.disabled = true;
    
    // Send message to background script to show reviews
    chrome.runtime.sendMessage({
      action: 'showReviews',
      source: reviewSource,
      autoDetect: autoDetect
    });
    
    // Close the popup after a short delay to show the loading state
    setTimeout(() => {
      window.close();
    }, 750);
  });
});

function saveSettings() {
  const reviewSource = document.getElementById('reviewSource').value;
  const autoDetect = document.getElementById('autoDetect').checked;
  
  chrome.storage.sync.set({
    reviewSource: reviewSource,
    autoDetect: autoDetect
  });
}
