var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    User = require("./models/user"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    passportLocalMongoose = require("passport-local-mongoose")
    // methodOverride = require("method-override"),
    // Cat = require("./models/cat"),
    // User = require("./models/user"),
    // Img = require("./models/image"),
    // fs = require("fs")

var catRoutes = require("./routes/catRoutes"),
    // 	userRoutes = require("./routes/userRouts"),
    indexRoutes = require("./routes/indexRoutes")

//if (process.env.NODE_ENV === 'goorm') {

//mongoose local connect
// console.log('MongoDB local connect')
// mongoose.set('useNewUrlParser', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
// mongoose.set('useUnifiedTopology', true);
// mongoose.connect("mongodb://localhost/391").then(() => {
//     console.log("database connected!")
// });

// }

// else {
mongoose.connect('mongodb+srv://alexDB:lyz19950912@cluster0-k44mz.mongodb.net/391Module2?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to cloud DB!");
}).catch(err => {
    console.log('ERR:', err.message);
});
// }


app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
// app.use(methodOverride("_method"));

//PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Yiheng is my son",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    //res.locals.error = req.flash("error");
    //res.locals.success = req.flash("success");
    next();
});


app.get("/", (req, res) => {
    res.render("landing");
});


app.use("/", indexRoutes);
app.use("/cats", catRoutes);



//Tell Express to listen to requests. Start server.
//if (process.env.NODE_ENV === 'goorm') {
app.listen(3000, function() {
    console.log("Local CPEN391 has started!!")
});
//} 

// else {
//     app.listen(process.env.PORT, process.env.IP, function() {
//         console.log("Cloud CPEN391 has started!!")
//     });
// }