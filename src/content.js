function operate(elementSelector, retryCount, doOperation) {
    if (retryCount <= 0) return;
    
    const element = document.querySelector(elementSelector);
    if (element) {
        doOperation(element);
        return
    }
    setTimeout(() => {
        operate(elementSelector, retryCount - 1, doOperation);
    }, 100);
}

const OPERATION_RETRY = 600;
function content_createTask(title, explanation) {
    popupDialog(() => {
        setDetail(title, explanation);
    });
}

function popupDialog(onPopup) {
    document.evaluate("//button[.//span[contains(text(), '作成')]]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.click();
    operate("div[aria-label='タスクを追加']", OPERATION_RETRY, onPopup);
}

function setDetail(title, explanation) {            
    operate("input[aria-label='タイトルを追加']", OPERATION_RETRY, element => {
        element.setAttribute("data-initial-value", title);
        element.value = title;
    });
    
    operate("textarea[aria-label='説明を追加']", OPERATION_RETRY, element => {
        element.value = explanation;
    });

    operate("input[aria-label='終日']", OPERATION_RETRY, element => {
        element.click();
    });
}

var clickedElement;

document.addEventListener("contextmenu", function(event){
    clickedElement = event.target;
}, true);

const REQUEST_ACTION_CREATE_TASK = "createTask";
const REQUEST_ACTION_GET_LINK = "getLink";

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    console.log("recieveMessage");
    switch (request.action) {
        case REQUEST_ACTION_CREATE_TASK:
            content_createTask(request.title, request.explanation);
            sendResponse({response: "finished"});
            break;
        case REQUEST_ACTION_GET_LINK:
            console.log(clickedElement);
            sendResponse({title: clickedElement.innerText, url: clickedElement.href});
            break;
        default:
            sendResponse({response: "unmatched"});
    }
});
