const bcrypt = require('bcrypt');
const express = require('express');
const app = express();
const User = require('./models/user');
const mongoose = require('mongoose');
const session = require('express-session');

mongoose.connect('mongodb://localhost:27017/authDemo', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true})); //urlencoded parse the incoming request. 
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: 'good'}))

const requireLogin = (req, res, next) => {
    if (!req.session.user_id){
       return res.redirect('/login')
    }
    next();
}

app.get('/', (req, res) => {
    res.send('THIS IS THE HOME PAGE')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', async (req, res)=> {
    const { password, username } = req.body;
    const user = new User({ username, password })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')
})


app.get('/login', (req, res)=> {
    res.render('login')
})

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if(foundUser){
        req.session.user_id = foundUser._id;
        res.redirect('/secret')
    } else {
        res.redirect('/login')
    }
})

app.post('/logout', (req, res) => {
    req.session.user_id = null;
    res.redirect('/login')
})


app.get ('/secret', requireLogin, (req, res) => {
        res.render('secret')
})

app.listen(3000, () => {
    console.log("serving your app!")
})




// const hashPassowrd = async (pw) => {
//     const salt = await bcrypt.genSalt(12);
//     const hash = await bcrypt.hash (pw, salt);
//     console.log (salt);
//     console.log (hash);
// }


// const hashPassowrd = async (pw) => {
//     const hash = await bcrypt.hash (pw, 12);
//     console.log (hash);
// }

// const login = async(pw, hashedPw) => {
//     const result = await bcrypt.compare(pw, hashedPw);
//     if (result){
//         console.log ("logged in!")
//     } else {
//         console.log ("incorrect!")
//     }
// }
// hashPassowrd('monkey');
// login('monkey', '$2b$12$tHlrwLGZ0jOKG4jR3q.Pu.cxtua7KMmR7ocapAyOTu.BOs5pcSzWy')