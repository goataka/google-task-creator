const GOOGLE_TASKS_URL = 'https://tasks.google.com/tasks/';

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
            chrome.tabs.sendMessage(tab.id, options, function (response) {
                console.log(response);
            });
        } else {
            setTimeout( () => {
                sendMessage(tab, title, explanation, retryCount-1);
            }, 10 );
        }
    });
}

const SEND_RETRY = 1000;
function createTask(title, explanation) {
    chrome.tabs.create({ url: GOOGLE_TASKS_URL }, tab => {
        sendMessage(tab, title, explanation, SEND_RETRY)
    });
}

chrome.action.onClicked.addListener(tab => {
    createTask(tab.title, tab.url);
});

chrome.runtime.onInstalled.addListener(() => {
    const parent = chrome.contextMenus.create({
        id: "create_task",
        title: "Create Task",
        type: "normal",
        contexts: ["link"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    switch (info.menuItemId) {
        case "create_task":
            const options = {
                action: "getLink",
            };
          chrome.tabs.sendMessage(tab.id, options, function (response) {
            console.log(response);
            createTask(response.title, response.url);
          });
          break;
    }
});
