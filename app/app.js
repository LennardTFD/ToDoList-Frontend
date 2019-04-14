class App {
    constructor()
    {
        this.config = {
            apiKey: "APIKEY",
            authDomain: "todolist-ID.firebaseapp.com",
            databaseURL: "https://todolist-ID.firebaseio.com",
            projectId: "todolist-ID",
            storageBucket: "todolist-ID.appspot.com",
            messagingSenderId: "SENDERID"
        };
        firebase.initializeApp(this.config);
        this.gui = new GUI();
        this.auth = new Auth();

        //Used to save current Scope during AuthCheck
        let _this = this;
        this.checkAuth = setInterval(function() {_this.checkAuthComplete();}, 10);

    }

    checkAuthComplete()
    {
        if(this.auth.getUid != undefined)
        {
            clearInterval(this.checkAuth);
            this.init();
        }
    }

    init()
    {
        this.todo = new ToDos(this.auth, this.gui);
        this.todo.streamAllLists();
        this.todo.setupTaskStream();
        this.gui.setTodo(this.todo);
        //this.gui.createList("Test", "Descr");
    }
}
