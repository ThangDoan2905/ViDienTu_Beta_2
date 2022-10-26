require('./config/db');

const app = require('express')();
const port = process.env.PORT || 3000;
const cookieParser = require('cookie-parser');
const sessions = require('express-session');
const UserRouter = require('./api/User');

const oneDay = 1000 * 60 * 60 * 24;

app.use(sessions({
    secret: "secretstring",
    saveUninitialized: true,
    cookie: {maxAge: oneDay},
    resave: true,
}));

const bodyParser = require('express').json;
app.use(bodyParser());

app.use('/', UserRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});