/* global console */
/* eslint-disable no-console */

const defaultFormats = [
  ['Markdown', '[%TITLE%](%URL%)'],
  ['HTML', '<a href="%URL_HTML%">%TITLE_HTML%</a>'],
  ['Plain', '%TITLE% - %URL%'],
  ['Seesaa', '[[%TITLE%>%URL%]]']
];

let formats;

function setFormats() {
  browser.storage.local.get('settings').then((settings) => {
    if (settings.settings) {
      formats = settings.settings.formats || defaultFormats;
    } else {
      formats = defaultFormats;
    }
    console.dir(formats);

    for (let i = 0; i < formats.length; i++) {
      browser.contextMenus.remove('copy-link-to-clipboard-link:' + String(i));
      browser.contextMenus.create({
        id: 'copy-link-to-clipboard-link:' + String(i),
        title: formats[i][0],
        contexts: ['link'],
      });

      browser.contextMenus.remove('copy-link-to-clipboard-page:' + String(i));
      browser.contextMenus.create({
        id: 'copy-link-to-clipboard-page:' + String(i),
        title: formats[i][0],
        contexts: ['page'],
      });
    }
  });
}

setFormats();
browser.storage.onChanged.addListener(setFormats);

browser.contextMenus.onClicked.addListener((info, tab) => {
  console.dir(info);
  const reg = /^copy-link-to-clipboard-(page|link):(\d+)$/;
  const matched = info.menuItemId.match(reg);
  if (matched.length !== 3) {
    return;
  }
  let formatIndex = +matched[2];
  if (formats.length <= formatIndex) {
    console.error('invalid format index: ' + formatIndex);
    return;
  }

  let url, title;
  if (matched[1] === 'page') {
    url = tab.url;
    title = tab.title;
  } else {
    url = info.linkUrl;
    title = info.linkText;
  }

  // from https://github.com/piroor/multipletab/blob/3ed44b0b3a5d4822574a2b4445dca03ee861b8ee/modules/documentToCopyText.js#L27
  const formatted = formats[formatIndex][1].replace(/%URL%/gi, url).replace(/%(?:TITLE|TEXT)%/gi, title).replace(/%URL_HTML(?:IFIED)?%/gi, escapeHtml(url)).replace(/%TITLE_HTML(?:IFIED)?%/gi, escapeHtml(title));

  const code = 'copyToClipboard(' + JSON.stringify(formatted) + ',)';

  browser.tabs.executeScript({
    code: 'typeof copyToClipboard === "function";',
  }).then((results) => {
    // The content script's last expression will be true if the function
    // has been defined. If this is not the case, then we need to run
    // clipboard-helper.js to define function copyToClipboard.
    if (!results || results[0] !== true) {
      return browser.tabs.executeScript(tab.id, {
        file: 'clipboard-helper.js',
      });
    }
  }).then(() => {
    return browser.tabs.executeScript(tab.id, {
      code,
    });
  }).catch((error) => {
    // This could happen if the extension is not allowed to run code in
    // the page, for example if the tab is a privileged page.
    console.error('Failed to copy text: ' + error);
  });
});

function escapeHtml(content) {
  return content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
