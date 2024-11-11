const bodyparser = require('body-parser');
const express=require('express');
const app=express();
const port=4000;
const session=require('express-session');
const path=require('path');
const cors = require('cors');

app.use(express.json());
app.use(cors({ origin: "http://localhost:4000", credentials: true }));
app.use(bodyparser.urlencoded({extended:false}));
app.use('/public',express.static(path.join('public')));

//set up session management
app.use(session(
    {
        secret:'process.env.SESSION_KEY',
        resave:false,
        saveUninitialized:true,
        cookie:{secure:false}
    }
));
//imports routes
const authRoutes=require('./routes/authRoutes');
const expenseRoutes=require('./routes/expenseRoutes');
const pageRoutes = require('./routes/pageRoutes');
const premiumRoutes = require('./routes/premiumRoutes');
const password_auth=require('./routes/password_auth');
//use routes
app.use(authRoutes);
app.use(pageRoutes);
app.use(expenseRoutes);
app.use(premiumRoutes);
app.use(password_auth);
app.listen(port,function()
{
    console.log("server running");
})
