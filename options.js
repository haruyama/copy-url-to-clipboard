/* global document */
const defaultSettings = {
  'formats': [
    ['Markdown', '[%TITLE%](%URL%)'],
    ['HTML', '<a href="%URL_HTML%">%TITLE_HTML%</a>'],
    ['Plain', '%TITLE% - %URL%'],
    ['Seesaa', '[[%TITLE%>%URL%]]'],
  ]
};

const saveOptions = (e) => {
  browser.storage.local.set({settings: JSON.parse(document.querySelector('#settings').value)});
  e.preventDefault();
};

const restoreOptions = () => {
  browser.storage.local.get('settings').then((settings) => {
    document.querySelector('#settings').textContent = JSON.stringify(settings.settings || defaultSettings, null, 2);
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelector('form').addEventListener('submit', saveOptions);
