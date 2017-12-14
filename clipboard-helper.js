// This function must be called in a visible page, such as a browserAction popup
// or a content script. Calling it in a background page has no effect!
/* global document */
/* eslint-disable no-unused-vars */
const copyToClipboard = (text, html) => {
  const oncopy = (event) => {
    document.removeEventListener('copy', oncopy, true);
    // Hide the event from the page to prevent tampering.
    event.stopImmediatePropagation();

    // Overwrite the clipboard content.
    event.preventDefault();
    event.clipboardData.setData('text/plain', text);
    event.clipboardData.setData('text/html', html);
  };
  document.addEventListener('copy', oncopy, true);

  // Requires the clipboardWrite permission, or a user gesture:
  document.execCommand('copy');
};
