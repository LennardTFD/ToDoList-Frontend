//Include page depending on GET Parameter
function importPage()
{
    //Move to "default" if no Parameter given
    if(!(window.location.href).includes("?p="))
    {
        window.location.href = "?p=default.html";
        return false;
    }
    //Get requested Page and include it
    var currentPage = (window.location.href).split("?p=");
    currentPage = currentPage[currentPage.length -1];
    var navLinks = $(".nav-link");
    for(var i = 0; i < navLinks.length; i++)
    {
        //Mark the current page in Nav as active
        if($(navLinks[i]).attr("href").includes(currentPage))
        {
            $(navLinks[i]).addClass("active");
            break;
        }
    }
    //Load html file in index page
    $("#contentArea").load(currentPage);
}

//Iterate through all Lists and draw them
function drawToDoLists(listData)
{
    //Get all List IDs
    var listIds = Object.keys(listData);
    var listAmount = listIds.length;
    var createdLists = [];

    for(var i = 0; i < listAmount; i++)
    {
        var drawn = drawToDo(listData[listIds[i]]);
        createdLists.push(drawn);
    }

    return createdLists;
}

//Creates new Div for List
function drawToDo(list)
{
    //Create new List Data
    var newList = $("<div id='" + list.listId + "' class='todo'>" +
        "<div class='todoHeader'>" +
        "<h4 class=''>" + list.listName + "</h4>" +
        "<p>" + list.listDescription + "</p>" +
        "<input class='taskName' placeholder='Name'>" +
        "<input class='taskDescription' placeholder='Beschreibung'>" +
        "<input class='taskDate' type='date' placeholder='Deadline'>" +
        "<input class='taskTime' type='time' placeholder='Deadline' value='12:00'>" +
        "<button class='taskCreate btn btn-primary'>Aufgabe erstellen</button>" +
        "<button class='listRemove btn btn-danger'>Liste löschen</button>" +
        "</div>" +
        "<div class='todoBody'>" +
        "</div>" +
        "</div>");

    //Append new List to HTML
    $("#todoLists").append(newList);

    return newList;
}
//Adds Task in List
function drawTask(listId, tasks)
{
    //Get Array of Task IDs
    var taskIds = Object.keys(tasks);
    var taskAmount = taskIds.length;

    var createdTasks = [];

    for(var i = 0; i < taskAmount; i++)
    {
        var task = tasks[taskIds[i]];
        var fin = "";

        //Add "finished" class to Task
        if(task.finished)
        {
            fin = "finished";
        }

        //Create new Task Data
        var newTask = $("<div id='" + task.taskId + "' class='task " + fin + "'>" +
            "<h5>" + task.title + "</h5>" +
            "<p>" + task.description + "</p>" +
            "<input class='statusChecker' style='margin: 10px;' type='checkbox'>" +
            "<button class='removeTask btn btn-danger'>Löschen</button>" +
            "</div>");

        //Append Task to corresponding List
        $("#" + listId).find(".todoBody").append(newTask);

        //check completed Task's checkbox
        if(task.finished)
        {
            $(newTask).find(".statusChecker").prop("checked", true);
        }

        //Push current added Task in Array of all created
        createdTasks.push(newTask);

    }
    return createdTasks;

}

//Default Action to execute on Page load
$(document).ready(function(){
    importPage();
});
