const GOOGLE_CALENDAR_WEEK_URL = 'https://calendar.google.com/calendar/u/0/r/week';

function sendMessage(tab, title, explanation, retryCount) {
    if (retryCount <= 0) return;
    
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0]) return;
        const currentTab = tabs[0];
        if (currentTab.status == 'complete') {
            const options = {
                action: "createTask",
                title: title,
                explanation: explanation
            };
            chrome.tabs.sendMessage(tab.id, options, function (response) {});
        } else {
            setTimeout( () => {
                sendMessage(tab, title, explanation, retryCount-1);
            }, 10 );
        }
    });
}

const SEND_RETRY = 1000;
function createTask(title, explanation) {
    chrome.tabs.create({ url: GOOGLE_CALENDAR_WEEK_URL }, tab => {
        sendMessage(tab, title, explanation, SEND_RETRY)
    });
}

chrome.action.onClicked.addListener(tab => {
    createTask(tab.title, tab.url);
});

chrome.runtime.onInstalled.addListener(() => {
    const parent = chrome.contextMenus.create({
        id: "create_task_menu",
        title: "Create Task",
        type: "normal",
        contexts: ["link"]
    });
});
  
chrome.contextMenus.onClicked.addListener((item) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0]) return;
        const currentTab = tabs[0];
        const options = {
            action: "getLink"
        };
        chrome.tabs.sendMessage(currentTab.id, options, function(response) {
            createTask(response.title, response.url);
        });
    });
});
