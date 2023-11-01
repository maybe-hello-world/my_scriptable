let TRELLO_API_KEY = "api-key"
let TRELLO_API_TOKEN = "api-token"
let TRELLO_LIST_1 = "list-id-1"
let TRELLO_LIST_2 = "list-id-2"

let lockScreen = args.widgetParameter == "lock" && config.runsInWidget

// number of cards to display
let itemCount = 10
if (config.runsInWidget) {
    itemCount = 5
}

// how many cards to show on lockScreen and what font size to use
if (lockScreen) {
    itemCount = 3
    lockFontSize = 11
}

async function getTasks(list_id) {
    const taskURL = `https://api.trello.com/1/lists/${list_id}/cards?key=${TRELLO_API_KEY}&token=${TRELLO_API_TOKEN}`
    let taskReq = new Request(taskURL)
    let data = await taskReq.loadJSON()
    return data.slice(0, itemCount).map(obj => obj.name)
}

const taskList1 = await getTasks(TRELLO_LIST_1);
const taskList2 = await getTasks(TRELLO_LIST_2);

const widget = new ListWidget()
let mainStack = widget.addStack();

let stack1 = mainStack.addStack();
stack1.layoutVertically();
for (const taskListName of taskList2) {
    let text = stack1.addText(taskListName)
    text.lineLimit = 1
    if (lockScreen) text.font = Font.systemFont(lockFontSize)
}

mainStack.addSpacer(10);

let stack2 = mainStack.addStack();
stack2.layoutVertically();
for (const taskListName of taskList1) {
    let text = stack2.addText(taskListName)
    text.lineLimit = 1
    if (lockScreen) text.font = Font.systemFont(lockFontSize)
}

if (config.runsInWidget) {
    Script.setWidget(widget);
} else {
    widget.presentLarge();
}