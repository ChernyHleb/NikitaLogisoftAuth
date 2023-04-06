require('dotenv').config();

const express = require("express");
const app =  express();
const db = require("./models");
const { User } = require("./models");
const jwt = require("jsonwebtoken");

app.use(express.json());

// HTTP Requests
app.post("/login", (req, res) => {
    // Auth User, create special token for user
    const email = req.body.email;
    const password = req.body.pwd;
    const user = { email: email };

    const accessToken = generateAccessToken(user);
    const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

    if(validateEmail(email)){
        User.findOne(
            { where: { email: email } }
        ).then((resUser) => { 
            if(resUser != null){
                if(resUser.pwd == password) {
                    User.update(
                        { token: refreshToken },
                        { where: { email: email }}
                    ).then(() => {
                        console.log("User " + email + ": token updated");
                        res.status(201);
                        res.json({ accessToken: accessToken, refreshToken: refreshToken });
                    }).catch((err)=>{
                        console.log(err);
                        res.status(500);
                        res.json({
                            message: "Internal Server Error",
                            error: err.message
                        });
                    });
                }
                else {
                    res.status(403);
                    res.json({
                        message: "Forbidden",
                        error: `Incorrect password for user ${email}`
                    });
                }
            }
            else{
                res.status(400);
                res.json({
                    message: "Bad Request",
                    error: `User ${email} doesnt exist`
                });
            }
        }).catch((err) => {
            console.log(err);
            res.status(500);
            res.json({
                message: "Internal Server Error",
                error: err.message
            });
        });
    }
    else{
        res.status(400);
        res.json({
            message: "Bad Request",
            error: "email format is incorrect"
        });
    }
});

app.post("/token", (req, res) => {
    const refreshToken = req.body.token;

    if(refreshToken == "" || refreshToken == null) {
        res.status(401);
        res.json({
            message: "Unauthorized",
            error: "refreshToken is null"
        });
    }
    else{
        User.findOne({ where: { token: refreshToken } })
        .then((user) => {
            if(user == null){
                return res.sendStatus(403);
            }

            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if(err){
                    return res.sendStatus(403);
                }
                const accessToken = generateAccessToken({ name: user.name });
                res.status(201);
                res.json({ accessToken: accessToken });
            });
        })
        .catch((err) => {
            console.log(err);
            res.status(500);
            res.json({
                message: "Internal Server Error",
                error: err.message
            });
        });
    }
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

app.delete('/logout', (req, res) => {
    const refreshToken = req.body.token;

    User.update(
        { token: null },
        { where: { token: refreshToken }}
    ).then(() => {
        res.sendStatus(204);
    }).catch((err) => {
        console.log(err);
        res.status(500);
        res.json({
            message: "Internal Server Error",
            error: err.message
        });
    });
});

// error 400 handler
app.use((req, res, next) => {
    const error = Error('400 Bad Request');
    error.status = 400;
    next(error);
});

// other errors handler
app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: String(err.status),
        error: err.message
    });
}); 

// DB Sync and running server
db.sequelize.sync().then(() => {
    console.log('DATABASE SYNC SUCCESS');
    app.listen(process.env.AUTH_SERVER_PORT, () => {
        console.log('SERVER RUNNING ON PORT ' + process.env.AUTH_SERVER_PORT);
    });
}).catch((e) => {
    console.error(e.message);
});
