// ========================== APP CONFIG ==============================

// DEPENDENCIES
var express               = require("express"),
	passport              = require("passport"),
	bodyParser            = require("body-parser"),
	LocalStrategy         = require("passport-local"),
	passportLocalMongoose = require("passport-local-mongoose"),
    mongoose              = require("mongoose"),
	User                  = require("./models/user");

// DATABASE CONNECTION
mongoose.connect("mongodb://localhost/auth_demo_app", {useNewUrlParser: true, useUnifiedTopology: true});

// APP VARIABLE
var app = express();

app.use(bodyParser.urlencoded({extended: true})); // THIS IS NEEDED ANY TIME YOU HAVE A FORM

// ============================ PASSPORT =================================

app.use(require("express-session")({
	secret: "The subaru WRX is one of the best cars ever made.",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session()); // SESSIONS ARE USED TO MONITOR WHEN USERS ARE SIGNED IN

// THESE TWO METHODS ARE CRITICAL TO PASSPORT, THEY ARE RESPONSIBLE FOR READING THE SESSION,
// TAKING WHAT IS ENCODED AND UNENCODING IT, AND THEN ENCODING IT AND PUTTING IN BACK INTO
// THE SESSION.
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


// ============================ ROUTES =================================

app.set('view engine', 'ejs');

app.get("/", function(req, res){
	res.render("home");
});

app.get("/secret", isLoggedIn, function(req, res){
	res.render("secret");
});

app.get("/register", function(req, res){
	res.render("register");
});

app.post("/register", function(req, res){
	// THE BELOW FUNCTION CREATES A NEW USER BUT DOES NOT SEND THE PASSWORD TO THE DATBASE
	// REGISTER WILL ACTUALLY HAS THE PASSWORD FIRST THEN SEND THE HASHED PASSWORD TO THE DATABASE
	User.register(new User({username: req.body.username}), req.body.password, function(err, user){
		if(err){
			console.log(err);
			return res.render('register');
		}
		// PASSPORT.AUTHENTICATE WILL CREATE A NEW SESSION AND LOG A USER IN TAKE STORE CORRENT INFORMATION
		// RUN THE SERIALIZED USER METHOD
		passport.authenticate("local")(req, res, function(){
			res.render("secret");
		});
	});
});

app.get("/login", function(req, res){
	res.render("login");
});

app.get("/loggedIn", isLoggedIn, function(req, res){
	res.render("loggedIn");
});

app.post("/login", passport.authenticate("local", {
	successRedirect: "/loggedIn",
	failureRedirect: "/login"
}) ,function(req, res){
	console.log("potato");
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});


function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("/login");
};

app.listen(3000, function() { 
  console.log('Auth app server listening on port 3000.'); 
});