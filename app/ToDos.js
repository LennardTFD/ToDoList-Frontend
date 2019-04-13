class ToDos {
    constructor(auth, gui) {
        this.mode = gui.getPage;

        this.auth = auth;
        this.firestore = firebase.firestore();
        this.gui = gui;

        if(this.mode == "todo.html")
        {
            this.path = this.firestore.collection("Users").doc(this.auth.getUid).collection("ToDo");
        }
        else if(this.mode == "todo_public.html")
        {
            this.path = this.firestore.collection("ToDos");
        }

    }

    streamAllLists() {
        let _this = this;
        //const ref = this.firestore.collection("Users").doc(this.auth.getUid).collection("ToDo");
        const ref = this.path;
        ref.onSnapshot(function (querySnapshot) {
            querySnapshot.docChanges().forEach(function(change) {
                if (change.type == "added") {
                    _this.gui.createList(change.doc);
                    _this.setupTaskStream(change.doc.id);
                } else if (change.type == "modified") {
                    _this.gui.updateList(change.doc);
                } else if (change.type == "removed") {
                    _this.gui.removeList(change.doc);
                }
            });
        });
    }

    setupTaskStream(listId)
    {
        if(listId != undefined)
        {
            console.info("Setting up Stream for " + listId);
            this.streamTasks(listId);
        }
    }

    streamTasks(listId) {
        const _this = this;
        //const ref = this.firestore.collection("Users").doc(this.auth.getUid).collection("ToDo").doc(listId).collection("Tasks");
        const ref = (this.path).doc(listId).collection("Tasks");

        ref.orderBy("deadline", "asc").onSnapshot(function (querySnapshot) {
            querySnapshot.docChanges().forEach(function(change) {
                console.log("Task Change!!");
                if(change.type == "added")
                {
                    _this.gui.createTask(listId, change.doc);
                }
                else if(change.type == "modified")
                {
                    _this.gui.updateTask(change.doc);
                }
                else if(change.type == "removed")
                {
                    _this.gui.removeTask(change.doc);
                }
            });
        });
    }



    createList(title, description)
    {
        const _this = this;
        const ref = this.path.doc();

        ref.set({
            title: title,
            description: description,
            authorId: _this.auth.getUid
        })
        .then(function(docRef)
        {
            console.log("Added new ToDoList with ID: " + docRef.id);
        })
        .catch(function (error) {
            console.log("Error when adding new ToDoList: " + error);
        });
    }

    removeList(toDoId) {
        const ref = this.path.doc(toDoId)
            .delete();
    }

    createTask(title, descr, deadline, toDoId)
    {
        const _this = this;
        const ref = this.path.doc(toDoId).collection("Tasks").doc();

        ref.set({
            title: title,
            description: descr,
            deadline: deadline,
            finished: false
        })
    }

    removeTask(toDoId, taskId)
    {
        console.log("Deleting... List: " + toDoId + " ID: " + taskId);
        const ref = this.path.doc(toDoId).collection("Tasks").doc(taskId).delete();
    }

    updateTask(toDoId, taskId, finished)
    {
        const ref = this.path.doc(toDoId).collection("Tasks").doc(taskId)
            .update({"finished": finished});
    }
}