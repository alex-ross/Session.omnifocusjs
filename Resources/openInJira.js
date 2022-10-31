(() => {
    function jiraKey(text) {
        function defaultKeyFinder(text) {
            const regex = /(\s|^|\[|\/)([A-Z]{2,5}-[0-9]{1,5})(\]|\s|$)/;
            const found = text.match(regex);
            if (found) {
                console.log("Found key using defaultKeyFinder")
                return found[2].trim()
            }
        }
        function keyFromJiraQueryParams(text) {
            const regex = /selectedIssue=([A-Z]{2,5}-[0-9]{1,7})/;
            const found = text.match(regex);
            if (found) {
                console.log("Found key using keyFromJiraQueryParams")
                return found[1].trim()
            }
        }

        return defaultKeyFinder(text) || keyFromJiraQueryParams(text)
    }

    function openJiraIssue(jiraKey) {
        let urlstr = `https://standoutab.atlassian.net/browse/${jiraKey}`
        let url = URL.fromString(urlstr)
        if (url) {
            url.open()
        } else {
            let alert = new Alert("URL Encoding Failure", `Failed to encode url: ${urlstr}`)
            alert.show()
        }
    }

    function findJiraKeyForTask(task) {
        if (!task) { return }

        const key = jiraKey(task.name) || jiraKey(task.note)

        if (key) {
            console.log("Has key")
            return key
        } else if (task.parent) {
            console.log("Has parent")
            return findJiraKeyForTask(task.parent)
        } else if (task.project) {
            console.log("Has project")
            return findJiraKeyForTask(task.project)
        } else {
            console.log("Match nothing")
        }
    }

    var action = new PlugIn.Action(function(selection) {
        let selected = selection.databaseObjects[0]

        const key = findJiraKeyForTask(selected)

        if (key) {
            openJiraIssue(key)
        }
    });

    // If needed, uncomment, and add a function that returns true if the current selection is appropriate for the action.
    action.validate = function(selection){
        if (selection.databaseObjects.length != 1) {
            return false
        } else {
            let task = selection.databaseObjects[0]
            if (task instanceof Task || task instanceof Project) {
                return !!findJiraKeyForTask(task)
            } else {
                return false
            }
        }
    }

    return action;
})();
