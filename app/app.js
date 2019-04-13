class App {
    constructor()
    {
        this.config = {
            apiKey: "AIzaSyBYs4IOGilhBBSAjfxMXlkN-8l144_kVnE",
            authDomain: "todolist-d6bbe.firebaseapp.com",
            databaseURL: "https://todolist-d6bbe.firebaseio.com",
            projectId: "todolist-d6bbe",
            storageBucket: "todolist-d6bbe.appspot.com",
            messagingSenderId: "752563920662"
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