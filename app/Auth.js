class Auth {

    constructor()
    {
        this.auth = firebase.auth();
        this.listener();
        this.trigger();
        this.httpUrl = "https://europe-west1-todolist-d6bbe.cloudfunctions.net/";

    }

    listener()
    {
        this.auth.onAuthStateChanged(firebaseUser => {
            //If logged in
            if(firebaseUser)
            {
                //Set Global Vars
                this.uid = firebaseUser.uid;
                this.displayName = firebaseUser.displayName;
                this.email = firebaseUser.email;
                this.photoURL = firebaseUser.photoURL;

                //Hide Login, Show Logout, Change display Name
                $("#loginNav").attr("hidden", true);
                $("#logoutNav").attr("hidden", false);
                $("#username").text(this.getDisplayName);

                //Set Profile Picture
                if(this.getPhotoURL != null)
                {
                    $("#avatar").attr("src", this.getPhotoURL);
                }
                else
                {
                    $("#avatar").attr("src", "https://d1nhio0ox7pgb.cloudfront.net/_img/o_collection_png/green_dark_grey/256x256/plain/user.png");
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
    }

    trigger()
    {
        //Setup Triggers for Authentication Buttons
        $("#login")[0].addEventListener("click", e => {
            this.login();
        });
        $("#register")[0].addEventListener("click", e => {
            this.register();
        });
        $("#logout")[0].addEventListener("click", e => {
            this.logout();
        });
    }

    register()
    {
        //Get Data from Input Fields
        var mail = $("#emailRegister").val();
        var password = $("#passwordRegister").val();
        var displayName = $("#displayNameRegister").val();

        //Ajax request to Backend (Currently GET)
        $.ajax({
            type: "GET",
            url: this.httpUrl + "createUser?email=" + mail + "&password=" + password + "&displayName=" + displayName,
            success: function(result){
                //console.log(result);
            }
        });

        //Fix "this" reference for setTimeout
        var _this = this;

        //Auto Login when finished Registering
        setTimeout(function() {
            const promise = _this.auth.signInWithEmailAndPassword(mail, password);
            promise.catch(e => console.log(e.message));
        }, 2000);
    }

    login()
    {
        var mail = $("#emailLogin").val();
        var password = $("#passwordLogin").val();

        //Login via Google Auth
        const promise = this.auth.signInWithEmailAndPassword(mail, password);
        promise.catch(e => console.log(e.message));
    }

    //Logout from Google Auth
    logout()
    {
        const promise = this.auth.signOut();
        promise.catch(e => console.log(e.message));

        setTimeout(function() {window.location.href = "?p=default.html"}, 500);
    }

    get getUid()
    {
        return this.uid;
    }

    get getEmail()
    {
        return this.email;
    }

    get getPhotoURL()
    {
        return this.photoURL;
    }

    get getDisplayName()
    {
        return this.displayName;
    }
}