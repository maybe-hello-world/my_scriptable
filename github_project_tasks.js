let GITHUB_PROJECT_TOKEN = "your-token"
let GITHUB_PROJECT_ID = "project-id"
let GITHUB_STATUS_1 = "status-1"
let GITHUB_STATUS_2 = "status-2"

// Extracts cards from GitHub project with certain statuses

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

async function getTasks(githubStatus) {
    const URL = 'https://api.github.com/graphql'
    const headers = {
        'Authorization': `bearer ${GITHUB_PROJECT_TOKEN}`,
            'Content-Type': 'application/json',
    }
    const requestData = {
        query: `{
          node(id: "${GITHUB_PROJECT_ID}") {
            ... on ProjectV2 {
              items(first: 100) {
                nodes {
                  fieldValues(first: 100) {
                    nodes {
                      ... on ProjectV2ItemFieldSingleSelectValue {
                        name
                      }
                    }
                  }
                  content {
                    ... on DraftIssue {
                      title
                    }
                    ... on Issue {
                      title
                    }
                    ... on PullRequest {
                      title
                    }
                  }
                }
              }
            }
          }
        }`,
    };


    let taskReq = new Request(URL)
    taskReq.method = "POST"
    taskReq.headers = headers
    taskReq.body = JSON.stringify(requestData)

    let jsonResponse = await taskReq.loadJSON()
    const items = jsonResponse.data.node.items.nodes;

    const titles = items.reduce((result, item) => {
        const fieldValue = item.fieldValues.nodes[1];
        if (fieldValue.name === githubStatus) {
            result.push(item.content.title);
        }
        return result;
    }, []);

    return titles.slice(0, itemCount)
}


const cardList1 = await getTasks(GITHUB_STATUS_1);
const cardList2 = await getTasks(GITHUB_STATUS_2);

const widget = new ListWidget()
let mainStack = widget.addStack();

let stack1 = mainStack.addStack();
stack1.layoutVertically();
for (const taskListName of cardList2) {
    let text = stack1.addText(taskListName)
    text.lineLimit = 1
    if (lockScreen) text.font = Font.systemFont(lockFontSize)
}

mainStack.addSpacer(10);

let stack2 = mainStack.addStack();
stack2.layoutVertically();
for (const taskListName of cardList1) {
    let text = stack2.addText(taskListName)
    text.lineLimit = 1
    if (lockScreen) text.font = Font.systemFont(lockFontSize)
}

if (config.runsInWidget) {
    Script.setWidget(widget);
} else {
    widget.presentLarge();
}