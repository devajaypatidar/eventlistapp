const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

var session = require('express-session');

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use(session({
    secret: 'oh my little dirty secret',
    resave: false,
    saveUninitialized: true,

}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://ajaypatidar:9AIMV8cSHaNCncRn@cluster0.jhcra.mongodb.net/EventDB', {
    dbName: 'eventList',
    useNewUrlParser: true,
    useUnifiedTopology: true
});





const UserSchema = new mongoose.Schema({
    name:String,
    username: String,
    password: String,
    event: [Object],
})

// const EventSchema = new mongoose.Schema({
//     eventname:String,
//     eventdesc:String,
//     startingdate: Date,
//     enddate: Date,
// })




UserSchema.plugin(passportLocalMongoose)
// UserSchema.plugin(findOrCreate);


const User = mongoose.model("User", UserSchema);
// const Event = mongoose.model("Events", EventSchema);

passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// used to serialize the user for the session
passport.serializeUser(function (user, done) {
    done(null, user.id);
    // where is this user.id going? Are we supposed to access this anywhere?
});

// used to deserialize the user
passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});


app.get('/', function (req, res) {
    res.redirect('/dashboard');
})

app.get('/dashboard', function (req, res) {


    if (req.isAuthenticated()) {
        
        User.findOne({ username: req.session.username }, function (err, result) {
            if (err) {
                console.log(err);
            }
            else {
                res.render('dashboard',{data: result.event})
            }
        });
    
        
    } else {
        res.render('login');
    }

    
    
})

app.get('/list', function(req, res) {
    res.render("list");
})


app.post('/event', function(req, res) {
    
    

    User.update({ username: req.session.username }, { $push: { event: req.body } },
        function (err, result) {
            if(err) {
                console.log(err);
            }else
            {
                
                res.redirect('/dashboard')
            }
        }
    );

})

app.post('/login', (req, res) => {

    const user = new User({
        email: req.body.username,
        password: req.body.password,
    });

    req.session.username = req.body.username;
    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/list");
            })
        }
    })

});

app.get('/login',(req, res)=>{
    res.render('login');
})


app.post('/register', (req, res) => {
    req.session.username = req.body.username;
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect('/login');
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/dashboard");
            })
        }
    });

});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function () {
    console.log('server is started succesfully');
})


