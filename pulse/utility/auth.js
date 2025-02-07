"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authEntry = void 0;
const site_1 = require("../site");
const maxLoginAttempts = site_1.Site.authMaxAttempts;
let redurl = "/";
let IPBlacklist = {};
const authenticate = (username, password, ip, callback) => {
    if (IPBlacklist[ip] ? IPBlacklist[ip] >= maxLoginAttempts : false) {
        callback(false, 'You are temporarily banned from using this service. Please try again later.');
    }
    // add auth check here
    else if (username == site_1.Site.authUser && password == site_1.Site.authPass) {
        callback(true);
    }
    else {
        if (IPBlacklist[ip]) {
            IPBlacklist[ip]++;
        }
        else {
            IPBlacklist[ip] = 1;
        }
        callback(false, 'username/password incorrect.');
    }
};
const generateRandomString = (length = 20) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
let loginurl = generateRandomString(20);
const sendLoginPage = (res, url, errorMessage = "") => {
    let htm = `
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${site_1.Site.authTitle}</title>
        <style>
            *{box-sizing: border-box;font-family: 'Courier New', Courier, monospace;outline: none;}
            body{margin:0px;padding:0px; background:#191c1e;font-size: 100%;}
            .contain{padding:10px; margin: 50px auto; width: 100%; max-width: 500px;text-align: center;overflow:hidden;}
            .inner-contain{width: 100%; padding: 20px; background: #212529;border-radius: 10px;-moz-border-radius: 10px;-webkit-border-radius: 10px;-o-border-radius: 10px;}
            h1{text-align: center; padding:10px 0px;margin:0px;margin-bottom:10px; color:#fff;font-size: 2rem;font-weight: 300;overflow: hidden;}
            form{width: 100%; overflow: hidden;}
            input{width: 100%; background-color: #fff; font-weight: normal;color: #191c1e; font-size: 1rem; margin-bottom: 30px;padding: 10px;border:none;border-radius: 5px;-moz-border-radius: 5px;-webkit-border-radius: 5px;-o-border-radius: 5px;}
            button{width: 100%; cursor: pointer; background-color: #198754; font-weight: 500;color: #fff; font-size: 1rem; padding: 10px;border:none;border-radius: 5px;-moz-border-radius: 5px;-webkit-border-radius: 5px;-o-border-radius: 5px; margin-bottom: 10px}
            span.error{font-size: 0.8rem; padding-bottom: 20px; display: block; color: #dc3545; font-weight: normal; overflow: hidden; text-align: center; width: 100%;}
        </style>
    </head>
    <body>
        <div class="contain">
            <div class="inner-contain">
                <h1>${site_1.Site.authTitle}</h1>
                ${errorMessage ? `<span class="error">${errorMessage}</span>` : ''}
                <form action="/${loginurl}" method="post">
                    <input placeholder="Username" type="text" name="username" required>
                    <input placeholder="Password" type="password" name="password" required>
                    <button type="submit">Sign in</button>
                </form>
            </div>
        </div>
    </body>
</html>
    `;
    res.status(401);
    res.type('html');
    res.send(htm);
};
const authEntry = (req, res, next) => {
    var _a;
    if (site_1.Site.auth) {
        if (req.session ? req.session['user'] : false) {
            if (req.path == `/logout` && req.method.toString().toLowerCase() == "get") {
                delete req.session.user;
                res.redirect(loginurl || req.headers['referer'] || redurl);
                setTimeout(() => {
                    // MySocket.broadcastLogout();
                }, 1000);
            }
            else {
                next();
            }
        }
        else {
            if (req.path == `/${loginurl}` && req.method.toString().toLowerCase() == "post") {
                let bd = req.body;
                let un = bd.username;
                let pw = bd.password;
                if (un && pw) {
                    authenticate(un, pw, (_a = req.ip) !== null && _a !== void 0 ? _a : "", (passed, err = "") => {
                        if (passed) {
                            if (req.session) {
                                req.session.user = un;
                            }
                            res.redirect(redurl);
                        }
                        else {
                            sendLoginPage(res, req.path, err);
                        }
                    });
                }
                else {
                    sendLoginPage(res, req.path, 'All fields are required.');
                }
            }
            else {
                sendLoginPage(res, req.path);
            }
        }
    }
    else {
        next();
    }
};
exports.authEntry = authEntry;
