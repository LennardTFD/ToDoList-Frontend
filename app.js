$(document).ready(function () {



(function()
{
    var config = {
        apiKey: "APIKEY",
        authDomain: "DOMAIN",
        databaseURL: "DBURÖ",
        projectId: "todolist-ID",
        storageBucket: "todolist-ID.appspot.com",
        messagingSenderId: "SENDERID"
    };
    firebase.initializeApp(config);

    //Hide Login/Logout Forms by default
    $("#loginNav").attr("hidden", true);
    $("#logoutNav").attr("hidden", true);

    const auth = firebase.auth();
    const firestore = firebase.firestore();
    const httpUrl = "https://europe-west1-todolist-ID.cloudfunctions.net/";

    let currentPage = (window.location.href).split("?p=");
    currentPage = currentPage[currentPage.length -1];

    //////////////////////////////////////////////////////AUTHENTICATION/////////////////////////////////////////////////

    //Global Authentication Data
    let uid, email, photoURL, displayName;

    //Register new Account
    function register()
    {

        //Get Data from Input Fields
        var mail = $("#emailRegister").val();
        var password = $("#passwordRegister").val();
        var displayName = $("#displayNameRegister").val();

        //Ajax request to Backend (Currently GET)
        $.ajax({
            type: "GET",
            url: httpUrl + "createUser?email=" + mail + "&password=" + password + "&displayName=" + displayName,
            success: function(result){
                console.log(result);
            }
        });

        //Auto Login when finished Registering
        setTimeout(function() {
            const promise = auth.signInWithEmailAndPassword(mail, password);
            promise.catch(e => console.log(e.message));
        }, 1500);
    }

    //Login User
    function login()
    {
        //Get Data from Input Fields
        var mail = $("#emailLogin").val();
        var password = $("#passwordLogin").val();

        //Login via Google Auth
        const promise = auth.signInWithEmailAndPassword(mail, password);
        promise.catch(e => console.log(e.message));

    }

    //Logout from Google Auth
    function logout()
    {
        const promise = auth.signOut();
        promise.catch(e => console.log(e.message));

        setTimeout(function() {window.location.href = "?p=default.html"}, 500);
    }

    //Check for Authentiation Changes and update Global Vars
    auth.onAuthStateChanged(firebaseUser => {
        //If logged in
        if(firebaseUser)
        {
            //Set Global Vars
            uid = firebaseUser.uid;
            displayName = firebaseUser.displayName;
            email = firebaseUser.email;
            photoURL = firebaseUser.photoURL;

            //Hide Login, Show Logout, Change display Name
            $("#loginNav").attr("hidden", true);
            $("#logoutNav").attr("hidden", false);
            $("#username").text(displayName);

            //Set Profile Picture
            if(photoURL != null)
            {
                $("#avatar").attr("src", photoURL);
            }
            else
            {
                $("#avatar").attr("src", "https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/256x256/plain/user.png");
            }

            if(currentPage == "todo.html")
            {
                console.log("GEtting Lists");
                getPrivateToDoLists();
                $("#createToDo")[0].addEventListener("click", e => {
                    createPrivateToDoList();
                });
                //getPublicToDoLists();
            }
            else if(currentPage == "todo_public.html")
            {
                console.log("GEtting Lists");
                $("#createToDo")[0].addEventListener("click", e => {
                    createPublicToDoList();
                });
                //getPrivateToDoLists();
                getPublicToDoLists();
            }

        }
        else
        {
            //If Logged out
            //Hide Logout Area, Show Login Area
            $("#loginNav").attr("hidden", false);
            $("#logoutNav").attr("hidden", true);
        }
    });

    //Setup Triggers for Authentication Buttons
    $("#login")[0].addEventListener("click", e => {
        login();
    });
    $("#register")[0].addEventListener("click", e => {
        register();
    });
    $("#logout")[0].addEventListener("click", e => {
        logout();
    });


    ////////////////////////////////////////AUTHENTICATION END////////////////////////////////////////////////
    ////////////////////////////////////PRIVATE TODOS AND TASKS//////////////////////////////////////////////

    //Get All private Lists
    function getPrivateToDoLists() {
        const ref = firestore.collection("Users").doc(uid).collection("ToDo");
        let toDos = {};
        ref.onSnapshot(function(querySnapshot) {
            toDos = {};
            querySnapshot.forEach(function(doc) {
                //Collect Lists and catch it's Tasks
                toDos[doc.id] = {"listId": doc.id, "listName": doc.data().title, "listDescription": doc.data().description};
                //Call Function to collect Tasks
                getTasksFromPrivateToDoLists(doc.id);
            });
            //Call function to draw ToDos
            $("#todoLists").html("");
            let drawnTodos = drawToDoLists(toDos);
            setCreateTaskHandler(drawnTodos);
            setRemoveListHandler(drawnTodos);
        })
    }


    function getTasksFromPrivateToDoLists(listId)
    {
        const ref = firestore.collection("Users").doc(uid).collection("ToDo").doc(listId).collection("Tasks");
        let tasks = {};
        //Order by Tasks, next to finish
        ref.orderBy("deadline", "asc")
        .onSnapshot(function(querySnapshot) {
            tasks = {};
            querySnapshot.forEach(function (doc) {
                if(doc.data() != undefined)
                {
                    //Collect Tasks inside List
                    tasks[doc.id] = {"taskId": doc.id, "title": doc.data().title, "description": doc.data().description, "finished": doc.data().finished, "deadline": doc.data().deadline};
                }
            });
            $("#" + listId).find(".todoBody").html("");
            let drawnTasks = drawTask(listId, tasks);
            console.log(drawnTasks);

            setRemoveTaskHandler(drawnTasks);
            setFinishedHandler(drawnTasks);
        });
        return tasks;
    }

    /////////////////////////////////////PRIVATE TODOS AND TASKS END//////////////////////////////////


    ////////////////////////////////////PUBLIC TODOS AND TASKS//////////////////////////////////////////////

    //Get All private Lists
    function getPublicToDoLists() {
        const ref = firestore.collection("ToDos");
        let toDos = {};
        ref.onSnapshot(function(querySnapshot) {
            toDos = {};
            querySnapshot.forEach(function(doc) {
                //Collect Lists and catch it's Tasks
                toDos[doc.id] = {"listId": doc.id, "listName": doc.data().title, "listDescription": doc.data().description, "listCreator": doc.data().creatorUid};
                //Call Function to collect Tasks
                getTasksFromPublicToDoLists(doc.id);
            });
            //Call function to draw ToDos
            $("#todoLists").html("");
            let drawnTodos = drawToDoLists(toDos);
            setCreateTaskHandler(drawnTodos);
            setRemoveListHandler(drawnTodos);
        })
    }


    function getTasksFromPublicToDoLists(listId)
    {
        const ref = firestore.collection("ToDos").doc(listId).collection("Tasks");
        let tasks = {};
        //Order by Tasks, next to finish
        ref.orderBy("deadline", "asc")
            .onSnapshot(function(querySnapshot) {
                tasks = {};
                querySnapshot.forEach(function (doc) {
                    if(doc.data() != undefined)
                    {
                        //Collect Tasks inside List
                        tasks[doc.id] = {"taskId": doc.id, "title": doc.data().title, "description": doc.data().description, "finished": doc.data().finished, "deadline": doc.data().deadline, "taskCreator": doc.data().creatorUid};
                    }
                });
                $("#" + listId).find(".todoBody").html("");
                let drawnTasks = drawTask(listId, tasks);
                console.log(drawnTasks);

                setRemoveTaskHandler(drawnTasks);
                setFinishedHandler(drawnTasks);
            });
        return tasks;
    }

    /////////////////////////////////////PUBLIC TODOS AND TASKS END//////////////////////////////////

    ///////////////////////////////////BUTTON TRIGGER//////////////////////////////

    function setRemoveTaskHandler(tasks)
    {
        tasks.forEach(function (button, index) {

            var sel = button.find(".removeTask");

            sel[0].addEventListener("click", function() {
                var toDoId = sel.parent().parent().parent().attr("id");
                var taskId = sel.parent().attr("id");

                if(confirm("Wirklich Löschen?"))
                {
                    $("#" + taskId).attr("hidden", true);

                    removeTaskFromPrivateToDoList(toDoId, taskId);
                }
            })
        })
    }

    function setFinishedHandler(tasks)
    {
        tasks.forEach(function (checkbox, index) {
            var sel = checkbox.find(".statusChecker");
            sel[0].addEventListener("change", function() {

                var toDoId = sel.parent().parent().parent().attr("id");
                var taskId = sel.parent().attr("id");

                sel.parent().toggleClass("finished");

                switchTaskFinishedFromPrivateToDoList(toDoId, taskId, sel[0].checked);
            })
        })
    }

    function setCreateTaskHandler(lists)
    {
        lists.forEach(function (list, index) {
            var sel = list.find(".taskCreate");
            sel[0].addEventListener("click", function() {
                //Get from Inputfields
                var toDoId = sel.parent().parent().attr("id");
                var title = sel.parent().find(".taskName:eq(0)").val();
                var descr = sel.parent().find(".taskDescription:eq(0)").val();
                var date = sel.parent().find(".taskDate:eq(0)").val();
                var time = sel.parent().find(".taskTime:eq(0)").val();

                //Calculate Datetime out of Date und Clock Time
                var calcDate = new Date(date).getTime();
                time = time.split(":");
                var milTime = (time[0] * 3600000) + (time[1] * 60000);
                var deadline = calcDate + milTime;

                //Add to Database, if Title and Description is set
                if(title != "" && descr != "")
                {
                    addTaskToPrivateToDoList(toDoId, title, descr, deadline);
                    console.log("Creating new Task. ToDo ID: " + toDoId);
                }

            })
        })
    }


    function setRemoveListHandler(lists)
    {
        lists.forEach(function (list, index) {
            var sel = list.find(".listRemove");
            sel[0].addEventListener("click", function() {
                var toDoId = sel.parent().parent().attr("id");

                if(confirm("Liste wirklich löschen?"))
                {
                    sel.parent().parent().remove();
                    removePrivateToDoList(toDoId);
                    console.log("Deleting List. ToDo ID: " + toDoId);
                }
            })
        })
    }



    ////////////////////////////////BUTTON TRRIGGER END/////////////////////////////////
    //////////////////////////////////DATABASE EVENTS/////////////////////////////////
    //Change Task Status (Finished or Unfinished)
    function switchTaskFinishedFromPrivateToDoList(toDoId, taskId, status)
    {
        const ref = firestore.collection("Users").doc(uid).collection("ToDo").doc(toDoId).collection("Tasks").doc(taskId)
            .update({"finished": status});
    }

    function switchTaskFinishedFromPublicToDoList(toDoId, taskId, status)
    {
        const ref = firestore.collection("ToDos").doc(toDoId).collection("Tasks").doc(taskId)
            .update({"finished": status});
    }

    //Removes Tasks from Private to Do list
    function removeTaskFromPrivateToDoList(toDoId, taskId)
    {
        const ref = firestore.collection("Users").doc(uid).collection("ToDo").doc(toDoId).collection("Tasks").doc(taskId)
        .delete();
    }

    function removeTaskFromPublicToDoList(toDoId, taskId)
    {
        const ref = firestore.collection("ToDos").doc(toDoId).collection("Tasks").doc(taskId)
            .delete();
    }

    //Removes ToDoList
    function removePrivateToDoList(toDoId)
    {
        const ref = firestore.collection("Users").doc(uid).collection("ToDo").doc(toDoId)
            .delete();
    }

    function removePublicToDoList(toDoId)
    {
        const ref = firestore.collection("ToDos").doc(toDoId)
            .delete();
    }


    //Create a new Private List
    function createPrivateToDoList()
    {
        const ref = firestore.collection("Users").doc(uid).collection("ToDo").doc();

        //Get Title and Description from Input-Fields
        const title = $("#todoTitel").val();
        const description = $("#todoDescription").val();

        //Add Title and Description to Database
        ref.set({
            "title": title,
            "description": description
        })
        .then(function(docRef)
        {
            console.log("Added new ToDoList with ID: " + docRef.id);
        })
        .catch(function (error) {
            console.log("Error when adding new ToDoList: " + error);
        });

        $("#todoLists").html("");
        //getPrivateToDoLists();
    }

    function createPrivateToDoList()
    {
        const ref = firestore.collection("ToDos").doc();

        //Get Title and Description from Input-Fields
        const title = $("#todoTitel").val();
        const description = $("#todoDescription").val();

        //Add Title and Description to Database
        ref.set({
            "title": title,
            "description": description
        })
            .then(function(docRef)
            {
                console.log("Added new ToDoList with ID: " + docRef.id);
            })
            .catch(function (error) {
                console.log("Error when adding new ToDoList: " + error);
            });

        $("#todoLists").html("");
        //getPublicToDoLists();
    }

    function addTaskToPrivateToDoList(todoList, title, description, deadline)
    {

        const ref = firestore.collection("Users").doc(uid).collection("ToDo").doc(todoList).collection("Tasks").doc();
        //Add Task to Liste
        ref.set({
            "title": title,
            "description": description,
            "deadline": deadline,
            "finished": false
        })
        .then(function(docRef)
        {
            console.log("Added new Task to ToDo List " + todoList + " with ID: " + docRef.id);
        })
        .catch(function (error) {
            console.log("Error when adding new ToDoList: " + error);
        });

        $("#" + todoList).find(".todoBody").html("");
        //getTasksFromPrivateToDoLists(todoList);
    }

    function addTaskToPublicToDoList(todoList, title, description, deadline)
    {

        const ref = firestore.collection("ToDos").doc(todoList).collection("Tasks").doc();
        //Add Task to Liste
        ref.set({
            "title": title,
            "description": description,
            "deadline": deadline,
            "finished": false
        })
            .then(function(docRef)
            {
                console.log("Added new Task to ToDo List " + todoList + " with ID: " + docRef.id);
            })
            .catch(function (error) {
                console.log("Error when adding new ToDoList: " + error);
            });

        $("#" + todoList).find(".todoBody").html("");
        //getTasksFromPrivateToDoLists(todoList);
    }

    /////////////////////////////////////////DATABASE EVENTS END//////////////////////////

    if(currentPage.includes("todo"))
    {
        console.log($("#createToDo"));
        $("#createToDo")[0].addEventListener("click", e => {
            createPrivateToDoList();
        });
    }
    if(currentPage.includes("todo_public.html"))
    {
        //$("#createToDo")[0].addEventListener("click", e => {
        //createPublicToDoList();
        //});
    }
}());
});

