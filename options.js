/* global document */
const defaultSettings = {
  'formats': [
    ['Markdown', '[%TITLE%](%URL%)'],
    ['Seesaa', '[[%TITLE%>%URL%]]'],
  ]
};

function saveOptions(e) {
  browser.storage.local.set({settings: JSON.parse(document.querySelector('#settings').value)});
  e.preventDefault();
}

function restoreOptions() {
  browser.storage.local.get('settings').then((settings) => {
    document.querySelector('#settings').textContent = JSON.stringify(settings.settings || defaultSettings, null, 2);
  });
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
