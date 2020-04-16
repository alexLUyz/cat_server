const DB = 'cloud_391Module2';
const PW = 'lyz19950912';

var express = require("express"),
    app = express(),
    bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    User = require("./models/user"),
    passport = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override")

var catRoutes = require("./routes/catRoutes"),
    postingRoutes = require("./routes/postingRoutes"),
    userRoutes = require("./routes/userRoutes"),
    indexRoutes = require("./routes/indexRoutes")


mongoose.connect('mongodb+srv://alexDB:' + PW + '@cluster0-k44mz.mongodb.net/' + DB + '?retryWrites=true&w=majority', {
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
app.use(methodOverride("_method"));

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
app.use("/users", userRoutes);
app.use("/cats", catRoutes);
app.use("/cats/:id/posts", postingRoutes);

//Tell Express to listen to requests. Start server.
app.listen(3000 || process.env.PORT, function() {
    console.log("Local CPEN391 has started!!")
});


// app.listen(process.env.PORT, process.env.IP, function() {
//     console.log("Cloud CPEN391 has started!!")
// });