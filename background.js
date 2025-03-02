// Listen for HTTP responses and modify headers
chrome.webRequest.onHeadersReceived.addListener(
    function(details) {
      // Filter out the X-Frame-Options header (remove it)
      const headers = details.responseHeaders.filter(header => header.name.toLowerCase() !== 'x-frame-options');
  
      // Modify Content-Security-Policy to allow embedding in iframe
      headers.push({
        name: 'Content-Security-Policy',
        value: "frame-ancestors 'self' https://yourdomain.com;" // Update with your domain
      });
  
      // Return the modified headers
      return { responseHeaders: headers };
    },
    {
      // Apply to all URLs or specify a more specific pattern (e.g., to block on a particular domain)
      urls: ["<all_urls>"]
    },
    [
      "blocking", // Block the request so we can modify the headers
      "responseHeaders" // We need access to the response headers
    ]
  );
  