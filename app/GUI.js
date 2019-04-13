class GUI
{
    constructor()
    {
        let _this = this;
        this.currentPage = this.getPage;
        this.importPage();
    }

    //Get ToDos Instance
    setTodo(todo)
    {
        this.todo = todo;
        this.handlerAddList();
    }

    importPage()
    {
        //Get requested Page and include it
        var navLinks = $(".nav-link");
        for(var i = 0; i < navLinks.length; i++)
        {
            //Mark the current page in Nav as active
            if($(navLinks[i]).attr("href").includes(this.currentPage))
            {
                $(navLinks[i]).addClass("active");
                break;
            }
        }


        //Load html file in index page
        $("#contentArea").load("pages/" + this.currentPage);

        if(this.currentPage.includes("todo"))
        {
            //this.handlerAddList();
        }
    }

    get getPage()
    {
        if((window.location.href).includes("?p="))
        {
            var currentPage = (window.location.href).split("?p=");
            currentPage = currentPage[currentPage.length -1];

            return currentPage;

        }else{
            window.location.href = "?p=default.html";
            return false;
        }
    }

    createList(list)
    {
        console.log(list.data());
        const data = list.data();
        //Create new List Data
        var newList = $("<div id='" + list.id + "' class='todo'>" +
            "<div class='todoHeader'>" +
            "<h4 class='listName'>" + data.title + "</h4>" +
            "<p class='listDescr'>" + data.description + "</p>" +
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

        this.handlerRemoveList(newList);
        this.handlerAddTask(newList);

    }

    updateList(list)
    {
        const listId = list.id;
        const elem = $("#" + listId);

        elem.find(".listName").text(list.data().title);
        elem.find(".listDescr").text(list.data().description);
    }

    removeList(list)
    {
        $("#" + list.id).remove();
    }

    createTask(listId, task)
    {
        let fin = "";
        const data = task.data();
        if(data.finished)
        {
            fin = "finished";
        }
        //Create new Task Data
        var newTask = $("<div id='" + task.id + "' class='task " + fin + "'>" +
            "<h5 class='taskName'>" + data.title + "</h5>" +
            "<p class='taskDescr'>" + data.description + "</p>" +
            "<input class='statusChecker' style='margin: 10px;' type='checkbox'>" +
            "<button class='removeTask btn btn-danger'>Löschen</button>" +
            "</div>");

        $("#" + listId).append(newTask);
        if(fin != "")
        {
            newTask.find(".statusChecker").prop("checked", true);
        }

        this.handlerRemoveTask(newTask);
        this.handlerUpdateTask(newTask);
    }

    updateTask(task)
    {
        const elem = $("#" + task.id);
        console.log(elem);
        //elem.find(".");
        elem.find(".taskName").text(task.data().title);
        elem.find(".taskDescr").text(task.data().description);
        elem.find(".statusChecker").prop("checked", task.data().finished);
    }

    removeTask(task)
    {
        $("#" + task.id).remove();
    }

    handlerRemoveTask(task)
    {

        const _this = this;

        const btn = task.find(".removeTask");
        btn[0].addEventListener("click", function() {
            var toDoId = btn.parent().parent().attr("id");
            var taskId = btn.parent().attr("id");

            if(confirm("Wirklich Löschen?"))
            {
                $("#" + taskId).attr("hidden", true);
                //removeTaskFromPrivateToDoList(toDoId, taskId);
                _this.todo.removeTask(toDoId, taskId);
            }
        })
    }
    handlerUpdateTask(task)
    {
        const _this = this;

        const box = task.find(".statusChecker");

        box[0].addEventListener("change", function() {

            var toDoId = box.parent().parent().attr("id");
            var taskId = box.parent().attr("id");

            box.parent().toggleClass("finished");

            _this.todo.updateTask(toDoId, taskId, box[0].checked);

            //switchTaskFinishedFromPrivateToDoList(toDoId, taskId, sel[0].checked);
        })
    }

    handlerAddTask(list)
    {

        const _this = this;

        const btn = list.find(".taskCreate");

        btn[0].addEventListener("click", function() {

            var toDoId = btn.parent().parent().attr("id");
            var title = btn.parent().find(".taskName:eq(0)").val();
            var descr = btn.parent().find(".taskDescription:eq(0)").val();
            var date = btn.parent().find(".taskDate:eq(0)").val();
            var time = btn.parent().find(".taskTime:eq(0)").val();

            //Calculate Datetime out of Date und Clock Time
            var calcDate = new Date(date).getTime();
            time = time.split(":");
            var milTime = (time[0] * 3600000) + (time[1] * 60000);
            var deadline = calcDate + milTime;

            //Add to Database, if Title and Description is set
            if(title != "" && descr != "")
            {
                //addTaskToPrivateToDoList(toDoId, title, descr, deadline);
                console.log("Creating new Task. ToDo ID: " + toDoId);

                _this.todo.createTask(title, descr, deadline, toDoId);
            }

        })

    }

    handlerRemoveList(list)
    {
        const _this = this;
        const btn = list.find(".listRemove");

        btn[0].addEventListener("click", function() {

            const toDoId = btn.parent().parent().attr("id");
            if(confirm("Liste wirklich löschen?"))
            {
                btn.parent().parent().remove();
                //removePrivateToDoList(toDoId);
                _this.todo.removeList(toDoId);

            }

        })
    }

    handlerAddList()
    {
        const _this = this;
        const btn = $("#createToDo");
        btn[0].addEventListener("click", function() {

            let title = $("#todoTitel").val();
            let description = $("#todoDescription").val();

            _this.todo.createList(title, description);
        })
    }
}