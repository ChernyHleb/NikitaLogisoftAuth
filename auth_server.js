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

    User.findOne(
        { where: { email: email } }
    ).then((resUser) => { 
        if(resUser != null && resUser.pwd == password) {
            User.update(
                { token: refreshToken },
                { where: { email: email }}
            ).then(() => {
                console.log("User " + email + ": token updated");
            });

            res.json({ accessToken: accessToken, refreshToken: refreshToken });
        }
        else {
            return res.sendStatus(403);
        }
    }).catch((err) => {
        console.log(err);
    });
});

app.post("/token", (req, res) => {
    const refreshToken = req.body.token;

    if (refreshToken == null) {
        return res.sendStatus(401);
    }

    User.findOne({ where: { token: refreshToken } })
    .then((user) => {
        if(user == null){
            return res.sendStatus(403);
        }

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if(err){
                res.sendStatus(403);
            }
            const accessToken = generateAccessToken({ name: user.name });
            res.json({ accessToken: accessToken });
        });
    })
    .catch((err) => {
        console.log(err);
    });
});

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}

app.delete('/logout', (req, res) => {
    const refreshToken = req.body.token;

    User.update(
        { token: null },
        { where: { token: refreshToken }}
    ).then(() => {
        res.sendStatus(204);
    })
    .catch((err) => {
        console.log(err);
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
