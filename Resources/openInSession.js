(() => {
    /**
     * Returns the estimated duration in minutes for the task or 25 minutes if
     * task doesn't have any estimated minutes.
     *
     * @param  {Task|Project} task The Omnifocus task
     * @return {number}    Number of minutes
     */
    function getSessionDuration(task) {
        return task.estimatedMinutes || 25
    }

    /**
     * Gets project for object
     *
     * @param {Task|Project} object The object to get project from
     * @return {Project}            The Omnifocus Project
     */
    function getProject(object) {
        if (object instanceof Task) {
          return object.containingProject
        }

        return object
    }

    /**
     * Gets the Session Category name
     *
     * @param {Task|Project} object The object to get project from
     * @return {Project}            The Omnifocus Project
     */
    function getSessionCategoryName(object) {
        const project = getProject(object)
        if (!project) { return "" }

        let parentFolder = project.parentFolder
        if (!parentFolder) { return "" }

        parentFolderName = parentFolder.name
        let folder = parentFolder
        while (folder.parent != null) {
            folder = folder.parent
        }

        return folder.name
    }

    /**
     * Gets the intent name for the Omnifocus task
     *
     * @param  {Task|Project} object The Omnifocus task
     * @return {string}    The Session intent as text
     */
    function getSessionIntent(object) {
        const removeTaskOrderNameRegexp = /【TASK (\d\d)】/
        const taskName = object.name.replace(removeTaskOrderNameRegexp, "").trim()
        const projectName = getProject(object).name
        return `${projectName} - ${taskName}`
    }

    var action = new PlugIn.Action(function(selection) {
        let selected = selection.databaseObjects[0]

        let intent = `intent=${encodeURIComponent(`${getSessionIntent(selected)}`)}`
        let category = `&categoryName=${encodeURIComponent(getSessionCategoryName(selected))}`
        let duration = `&duration=${getSessionDuration(selected)}`
        let urlstr = `session:///start?${intent}${duration}${category}`
        console.log(urlstr)
        let url = URL.fromString(urlstr)
        if (url) {
            url.open()
        } else {
            let alert = new Alert("URL Encoding Failure", `Failed to encode url: ${urlstr}`)
            alert.show()
        }
    });

    // If needed, uncomment, and add a function that returns true if the current selection is appropriate for the action.
    action.validate = function(selection){
        if (selection.databaseObjects.length != 1) {
            return false
        } else {
            let type = selection.databaseObjects[0]
            if (type instanceof Task || type instanceof Project) {
                return true
            } else {
                return false
            }
        }
    };

    return action;
})();
