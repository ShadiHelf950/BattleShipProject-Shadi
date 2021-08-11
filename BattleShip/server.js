const express = require('express')
const mysql = require('mysql')
const bodyParser = require('body-parser')
const path = require('path')
const http = require('http')
const PORT = process.env.PORT || 3000
const socketio = require('socket.io')
const app = express()
const cors = require('cors')
const nodemailer = require("nodemailer")
const server = http.createServer(app)
const io = socketio(server)
const url = require('url');  

var playerNumber = -1

// Set up database
const dataBase = mysql.createConnection({
    host: 'sql6.freesqldatabase.com',
    port: 3306,
    user: 'sql6430252',
    password: 't67Npfs4DB',
    database:'sql6430252'
})


// Connect to database
dataBase.connect(function (err) {
    if (err) throw err;
    else {
        console.log("Successfully connected to MySQL database");
    }
});

// Use body parser
app.use(bodyParser.json());

// Set static folder
app.use(express.static(path.join(__dirname, "public")))

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
extended: true }));

app.use(cors())

//routes

app.post('/MultiPlayer.html', function (req, res) { // Confirm online game result

    console.log(req.body.winner)
    console.log(req.body.loser)

    if (req.body.winner != 'Other')
    {
        var sql = `SELECT * FROM players WHERE Username = '${req.body.winner}'`;

        dataBase.query(sql, function (err, result) {

            if (err) throw err;

            else
            {
                var new_points = result[0].Points + 10

                var updateSql = `UPDATE players SET Points = ${new_points} WHERE Username = '${req.body.winner}'`

                dataBase.query(updateSql, function (err, result) {

                    if (err) throw err;

                    else console.log("winner points updated")

                });
            }
  
        });
    }

    setTimeout(function () {

        var resultStr = ''

        resultStr += '<!DOCTYPE html>'
        resultStr += '<html>'
        resultStr += '<head>'

        resultStr += '<style>'

        resultStr += 'body {background-color: darkblue;'
        resultStr += 'font - family: Garamond;'
        resultStr += 'height: 100 %;'
        resultStr += 'overflow: auto;'
        resultStr += '}'

        resultStr += '.main_title {'
        resultStr += "font-family: 'Trebuchet MS';"
        resultStr += 'font-size: 70px;'
        resultStr += 'height: 100px;'
        resultStr += 'width: 500px;'
        resultStr += 'text-decoration: double;'
        resultStr += 'text-align: center;'
        resultStr += 'margin-left: 420px;'
        resultStr += 'color: aqua;'
        resultStr += '}'

        resultStr += '.note {'
        resultStr += "font-family: 'Trebuchet MS';"
        resultStr += 'font-size: 35px;'
        resultStr += 'height: 100px;'
        resultStr += 'width: 500px;'
        resultStr += 'text-decoration: double;'
        resultStr += 'text-align: center;'
        resultStr += 'margin-left: 420px;'
        resultStr += 'margin-top: 100px;'
        resultStr += 'color: yellow;'
        resultStr += '}'

        resultStr += '.button {'
        resultStr += 'background-color: brown;'
        resultStr += 'border:groove;'
        resultStr += 'color:aqua;'
        resultStr += 'padding: 16px 33px;'
        resultStr += 'text-align: center;'
        resultStr += `font-family: 'Trebuchet MS';`
        resultStr += 'text-decoration: double;'
        resultStr += 'font-size: 30px;'
        resultStr += 'margin-left: 100px;'
        resultStr += 'margin-top: 30px;'
        resultStr += 'display: block;'
        resultStr += 'cursor: pointer;'
        resultStr += 'border-radius: .5em;'
        resultStr += '}'


        resultStr += '</style>'

        resultStr += '<meta charset="utf-8" />'
        resultStr += '<title>MultiPlayer</title>'
        resultStr += '</head>'
        resultStr += '<body>'

        resultStr += '<div class="main_title">MultiPlayer</div >'

        resultStr += '<div class="note">'

        if (req.body.winner != 'Other')
        {
            resultStr += req.body.winner
            resultStr += '<br/>YOU WON THIS MATCH !!! (Gained 10 Points)<br/>'
        }

        if (req.body.loser != 'Other')
        {
            resultStr += req.body.loser
            resultStr += '<br/>YOU LOST THIS MATCH (No Points Gained)<br/>'
        }

        resultStr += `<button class="button" onclick="location.href ='Index.html';"> Back To Main Page </button>`
        resultStr += '</div>'

        resultStr += '</body>'
        resultStr += '</html>'

        res.send(resultStr);

    }, 6000);


});

app.post('/MultiPlayerLogin.html', function (req, res) { // Redirect player to a multiplayer match

    console.log(req.body.name)
    console.log(req.body.password)

    var sql = `SELECT Username, Password FROM players WHERE Username = '${req.body.name}' AND Password = '${req.body.password}'`;

    dataBase.query(sql, function (err, result) {
        if (err) throw err;

        if (result.length > 0) {

            res.redirect(url.format({
                pathname: "http://localhost:3000/MultiPlayer.html",
                query: {
                    "Username": req.body.name,
                    "PlayerIndex": playerNumber
                }
            }));

        }

        else {
            console.log('no such player exists')

            var resultStr = ''

            resultStr += '<!DOCTYPE html>'
            resultStr += '<html>'
            resultStr += '<head>'

            resultStr += '<style>'

            resultStr += 'body {background-color: darkblue;'
            resultStr += 'font - family: Garamond;'
            resultStr += 'height: 100 %;'
            resultStr += 'overflow: auto;'
            resultStr += '}'

            resultStr += '.main_title {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 70px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'color: aqua;'
            resultStr += '}'

            resultStr += '.note {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 23px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'margin-top: 100px;'
            resultStr += 'color: yellow;'
            resultStr += '}'

            resultStr += '</style>'

            resultStr += '<meta charset="utf-8" />'
            resultStr += '<title>MultiPlayer</title>'
            resultStr += '</head>'
            resultStr += '<body>'

            resultStr += '<div class="main_title">MultiPlayer</div >'

            resultStr += '<div class="note">'
            resultStr += 'The player information that you have entered is either wrong or does not exist.<br/>'
            resultStr += 'Please enter correct username and password.'
            resultStr += "</div>"

            resultStr += '</body>'
            resultStr += '</html>'

            res.send(resultStr);
        }
    });
});

app.post('/AccountEditPage.html', (req, res) => { // Update player info in the system

    console.log(req.body.name)
    console.log(req.body.password)
    console.log(req.body.email)
    console.log(req.body.new_name)
    console.log(req.body.new_password)
    console.log(req.body.new_email)

    var sql = `SELECT * FROM players WHERE Username = '${req.body.name}' AND Password = '${req.body.password}' AND Email = '${req.body.email}'`;

    dataBase.query(sql, function (err, result) {
        if (err) throw err;
        if (result.length > 0) {

            if (!req.body.new_name && !req.body.new_password && !req.body.new_email) {

                var resultStr = ''

                resultStr += '<!DOCTYPE html>'
                resultStr += '<html>'
                resultStr += '<head>'

                resultStr += '<style>'

                resultStr += 'body {background-color: darkblue;'
                resultStr += 'font - family: Garamond;'
                resultStr += 'height: 100 %;'
                resultStr += 'overflow: auto;'
                resultStr += '}'

                resultStr += '.main_title {'
                resultStr += "font-family: 'Trebuchet MS';"
                resultStr += 'font-size: 70px;'
                resultStr += 'height: 100px;'
                resultStr += 'width: 500px;'
                resultStr += 'text-decoration: double;'
                resultStr += 'text-align: center;'
                resultStr += 'margin-left: 420px;'
                resultStr += 'color: aqua;'
                resultStr += '}'

                resultStr += '.note {'
                resultStr += "font-family: 'Trebuchet MS';"
                resultStr += 'font-size: 23px;'
                resultStr += 'height: 100px;'
                resultStr += 'width: 500px;'
                resultStr += 'text-decoration: double;'
                resultStr += 'text-align: center;'
                resultStr += 'margin-left: 420px;'
                resultStr += 'margin-top: 100px;'
                resultStr += 'color: yellow;'
                resultStr += '}'

                resultStr += '</style>'

                resultStr += '<meta charset="utf-8" />'
                resultStr += '<title>Account Edit</title>'
                resultStr += '</head>'
                resultStr += '<body>'

                resultStr += '<div class="main_title">Account Edit</div>'

                resultStr += '<div class="note">'
                resultStr += 'No new information for update were sent.<br/>'
                resultStr += 'Please enter new information you want to update if you want updating your information'
                resultStr += "</div>"

                resultStr += '</body>'
                resultStr += '</html>'

                res.send(resultStr);
            }

            var updateEmail = req.body.email

            var updateSql = ''

            var checkSql = '';

            if (req.body.new_name && !req.body.new_password && !req.body.new_email) {
                checkSql = `SELECT * FROM players WHERE Username = '${req.body.new_name}'`
                updateSql = `UPDATE players SET Username = '${req.body.new_name}' WHERE Username = '${req.body.name}' AND Password = '${req.body.password}' AND Email = '${req.body.email}'`
            }

            else if (!req.body.new_name && req.body.new_password && !req.body.new_email) {
                checkSql = `SELECT * FROM players WHERE Password = '${req.body.new_password}'`
                updateSql = `UPDATE players SET Password = '${req.body.new_password}' WHERE Username = '${req.body.name}' AND Password = '${req.body.password}' AND Email = '${req.body.email}'`
            }

            else if (!req.body.new_name && !req.body.new_password && req.body.new_email) {
                checkSql = `SELECT * FROM players WHERE Email = '${req.body.new_email}'`
                updateSql = `UPDATE players SET Email = '${req.body.new_email}' WHERE Username = '${req.body.name}' AND Password = '${req.body.password}' AND Email = '${req.body.email}'`
                updateEmail = req.body.new_email
            }

            else if (req.body.new_name && req.body.new_password && !req.body.new_email) {
                checkSql = `SELECT * FROM players WHERE Username = '${req.body.new_name}' OR Password = '${req.body.new_password}'`
                updateSql = `UPDATE players SET Username = '${req.body.new_name}', Password = '${req.body.new_password}' WHERE Username = '${req.body.name}' AND Password = '${req.body.password}' AND Email = '${req.body.email}'`
            }
                
            else if (req.body.new_name && !req.body.new_password && req.body.new_email) {
                checkSql = `SELECT * FROM players WHERE Username = '${req.body.new_name}' OR Email = '${req.body.new_email}'`
                updateSql = `UPDATE players SET Username = '${req.body.new_name}', Email = '${req.body.new_email}' WHERE Username = '${req.body.name}' AND Password = '${req.body.password}' AND Email = '${req.body.email}'`
                updateEmail = req.body.new_email
            }

            else if (!req.body.new_name && req.body.new_password && req.body.new_email) {
                checkSql = `SELECT * FROM players WHERE Password = '${req.body.new_password}' OR Email = '${req.body.new_email}'`
                updateSql = `UPDATE players SET Password = '${req.body.new_password}', Email = '${req.body.new_email}' WHERE Username = '${req.body.name}' AND Password = '${req.body.password}' AND Email = '${req.body.email}'`
                updateEmail = req.body.new_email
            }

            else {
                checkSql = `SELECT * FROM players WHERE Username = '${req.body.new_name}' OR Password = '${req.body.new_password}' OR Email = '${req.body.new_email}'`
                updateSql = `UPDATE players SET Username = '${req.body.new_name}', Password = '${req.body.new_password}', Email = '${req.body.new_email}' WHERE Username = '${req.body.name}' AND Password = '${req.body.password}' AND Email = '${req.body.email}'`
                updateEmail = req.body.new_email
            }


            dataBase.query(checkSql, function (err, result) {
                if (err) throw err;

                else
                {
                    console.log("record already exists");

                    if (result.length > 0) {
                        var resultStr = ''

                        resultStr += '<!DOCTYPE html>'
                        resultStr += '<html>'
                        resultStr += '<head>'

                        resultStr += '<style>'

                        resultStr += 'body {background-color: darkblue;'
                        resultStr += 'font - family: Garamond;'
                        resultStr += 'height: 100 %;'
                        resultStr += 'overflow: auto;'
                        resultStr += '}'

                        resultStr += '.main_title {'
                        resultStr += "font-family: 'Trebuchet MS';"
                        resultStr += 'font-size: 70px;'
                        resultStr += 'height: 100px;'
                        resultStr += 'width: 500px;'
                        resultStr += 'text-decoration: double;'
                        resultStr += 'text-align: center;'
                        resultStr += 'margin-left: 420px;'
                        resultStr += 'color: aqua;'
                        resultStr += '}'

                        resultStr += '.note {'
                        resultStr += "font-family: 'Trebuchet MS';"
                        resultStr += 'font-size: 23px;'
                        resultStr += 'height: 100px;'
                        resultStr += 'width: 500px;'
                        resultStr += 'text-decoration: double;'
                        resultStr += 'text-align: center;'
                        resultStr += 'margin-left: 420px;'
                        resultStr += 'margin-top: 100px;'
                        resultStr += 'color: yellow;'
                        resultStr += '}'

                        resultStr += '</style>'

                        resultStr += '<meta charset="utf-8" />'
                        resultStr += '<title>Account Edit</title>'
                        resultStr += '</head>'
                        resultStr += '<body>'

                        resultStr += '<div class="main_title">Account Edit</div>'

                        resultStr += '<div class="note">'
                        resultStr += 'An account with a similar info already exists.<br/>'
                        resultStr += 'Try entering different infromation to update.'
                        resultStr += "</div>"

                        resultStr += '</body>'
                        resultStr += '</html>'

                        res.send(resultStr);
                    }

                    else {
                        dataBase.query(updateSql, function (err, result) {
                            if (err) throw err;
                            console.log("1 record updated");
                        });

                        // create reusable transporter object using the default SMTP transport
                        let transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'noreplybattleship101@gmail.com',
                                pass: 'BattleShip101'
                            }
                        });

                        var mailOptions = {
                            from: 'noreplybattleship101@gmail.com', // sender address
                            to: updateEmail, // list of receivers
                            subject: "Account Update Confirmation", // Subject line
                            html: "Hello, <br/><br/> Your account information were updated successfully."
                                + "<br /><br/> Have a good day."

                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log('Email was sent successfully');
                            }
                        });

                        var resultStr = ''

                        resultStr += '<!DOCTYPE html>'
                        resultStr += '<html>'
                        resultStr += '<head>'

                        resultStr += '<style>'

                        resultStr += 'body {background-color: darkblue;'
                        resultStr += 'font - family: Garamond;'
                        resultStr += 'height: 100 %;'
                        resultStr += 'overflow: auto;'
                        resultStr += '}'

                        resultStr += '.main_title {'
                        resultStr += "font-family: 'Trebuchet MS';"
                        resultStr += 'font-size: 70px;'
                        resultStr += 'height: 100px;'
                        resultStr += 'width: 500px;'
                        resultStr += 'text-decoration: double;'
                        resultStr += 'text-align: center;'
                        resultStr += 'margin-left: 420px;'
                        resultStr += 'color: aqua;'
                        resultStr += '}'

                        resultStr += '.note {'
                        resultStr += "font-family: 'Trebuchet MS';"
                        resultStr += 'font-size: 23px;'
                        resultStr += 'height: 100px;'
                        resultStr += 'width: 500px;'
                        resultStr += 'text-decoration: double;'
                        resultStr += 'text-align: center;'
                        resultStr += 'margin-left: 420px;'
                        resultStr += 'margin-top: 100px;'
                        resultStr += 'color: yellow;'
                        resultStr += '}'

                        resultStr += '</style>'

                        resultStr += '<meta charset="utf-8" />'
                        resultStr += '<title>Account Edit</title>'
                        resultStr += '</head>'
                        resultStr += '<body>'

                        resultStr += '<div class="main_title">Account Edit</div>'

                        resultStr += '<div class="note">'
                        resultStr += 'Your account information were updated successfully.<br/>'
                        resultStr += 'Check your email address for a confirmation message.'
                        resultStr += "</div>"

                        resultStr += '</body>'
                        resultStr += '</html>'

                        res.send(resultStr);
                    }
                }
                
            });
        }

        else {
            var resultStr = ''

            resultStr += '<!DOCTYPE html>'
            resultStr += '<html>'
            resultStr += '<head>'

            resultStr += '<style>'

            resultStr += 'body {background-color: darkblue;'
            resultStr += 'font - family: Garamond;'
            resultStr += 'height: 100 %;'
            resultStr += 'overflow: auto;'
            resultStr += '}'

            resultStr += '.main_title {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 70px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'color: aqua;'
            resultStr += '}'

            resultStr += '.note {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 23px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'margin-top: 100px;'
            resultStr += 'color: yellow;'
            resultStr += '}'

            resultStr += '</style>'

            resultStr += '<meta charset="utf-8" />'
            resultStr += '<title>Account Edit</title>'
            resultStr += '</head>'
            resultStr += '<body>'

            resultStr += '<div class="main_title">Account Edit</div>'

            resultStr += '<div class="note">'
            resultStr += 'Your account information were not updated successfully.<br/>'
            resultStr += 'Either your username is incorrect or password is incorrect or both are incorrect.<br/>'
            resultStr += "If you don't have an account yet, you can create a new account by going to the registration page.<br/>"
            resultStr += "</div>"

            resultStr += '</body>'
            resultStr += '</html>'

            res.send(resultStr);
        }
    });
})

app.post('/DeleteAccountPage.html', (req, res) => { // Delete players from the system

    console.log(req.body.name)
    console.log(req.body.password)
    console.log(req.body.email)

    var sql = `SELECT Username, Password FROM players WHERE Username = '${req.body.name}' AND Password = '${req.body.password}' AND Email = '${req.body.email}'`;

    dataBase.query(sql, function (err, result) {
        if (err) throw err;
        if (result.length > 0) {

            var sql = `DELETE FROM players WHERE Username = '${req.body.name}' AND Password = '${req.body.password}' AND Email = '${req.body.email}'`;

            dataBase.query(sql, function (err, result) {
                if (err) throw err;
                else {

                    // create reusable transporter object using the default SMTP transport
                    let transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'noreplybattleship101@gmail.com',
                            pass: 'BattleShip101'
                        }
                    });

                    var mailOptions = {
                        from: 'noreplybattleship101@gmail.com', // sender address
                        to: req.body.email, // list of receivers
                        subject: "Account Deletion Confirmation", // Subject line
                        html: "Hello, <br/><br/> Your account was deleted successfully."
                            + "<br /><br/> Have a good day."

                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email was sent successfully');
                        }
                    });

                    console.log("successfully deleted player");

                    var resultStr = ''

                    resultStr += '<!DOCTYPE html>'
                    resultStr += '<html>'
                    resultStr += '<head>'

                    resultStr += '<style>'

                    resultStr += 'body {background-color: darkblue;'
                    resultStr += 'font - family: Garamond;'
                    resultStr += 'height: 100 %;'
                    resultStr += 'overflow: auto;'
                    resultStr += '}'

                    resultStr += '.main_title {'
                    resultStr += "font-family: 'Trebuchet MS';"
                    resultStr += 'font-size: 70px;'
                    resultStr += 'height: 100px;'
                    resultStr += 'width: 500px;'
                    resultStr += 'text-decoration: double;'
                    resultStr += 'text-align: center;'
                    resultStr += 'margin-left: 420px;'
                    resultStr += 'color: aqua;'
                    resultStr += '}'

                    resultStr += '.note {'
                    resultStr += "font-family: 'Trebuchet MS';"
                    resultStr += 'font-size: 23px;'
                    resultStr += 'height: 100px;'
                    resultStr += 'width: 500px;'
                    resultStr += 'text-decoration: double;'
                    resultStr += 'text-align: center;'
                    resultStr += 'margin-left: 420px;'
                    resultStr += 'margin-top: 100px;'
                    resultStr += 'color: yellow;'
                    resultStr += '}'

                    resultStr += '</style>'

                    resultStr += '<meta charset="utf-8" />'
                    resultStr += '<title>Delete Account</title>'
                    resultStr += '</head>'
                    resultStr += '<body>'

                    resultStr += '<div class="main_title">Delete Account</div>'

                    resultStr += '<div class="note">'
                    resultStr += 'Your account was deleted successfuly.<br/>'
                    resultStr += 'Check your email for a conformation message.'
                    resultStr += "</div>"

                    resultStr += '</body>'
                    resultStr += '</html>'

                    res.send(resultStr);
                }
            });
        }

        else {
            var resultStr = ''

            resultStr += '<!DOCTYPE html>'
            resultStr += '<html>'
            resultStr += '<head>'

            resultStr += '<style>'

            resultStr += 'body {background-color: darkblue;'
            resultStr += 'font - family: Garamond;'
            resultStr += 'height: 100 %;'
            resultStr += 'overflow: auto;'
            resultStr += '}'

            resultStr += '.main_title {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 70px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'color: aqua;'
            resultStr += '}'

            resultStr += '.note {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 23px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'margin-top: 100px;'
            resultStr += 'color: yellow;'
            resultStr += '}'

            resultStr += '</style>'

            resultStr += '<meta charset="utf-8" />'
            resultStr += '<title>Delete Account</title>'
            resultStr += '</head>'
            resultStr += '<body>'

            resultStr += '<div class="main_title">Delete Account</div>'

            resultStr += '<div class="note">'
            resultStr += 'The information that you have entered is not correct.<br/>'
            resultStr += 'Either your username is incorrect or password is incorrect or email is incorrect,<br/>'
            resultStr += 'or all of them are incorrect. Enter valid information and try again.'
            resultStr += "</div>"

            resultStr += '</body>'
            resultStr += '</html>'

            res.send(resultStr);
        }
    });
})

app.post('/RegisterPage.html', (req, res) => { // Register player in system

    console.log(req.body.name)
    console.log(req.body.email)
    console.log(req.body.password)
    console.log(req.body.date)

    var sql = `SELECT * FROM players WHERE Username = '${req.body.name}' OR Password = '${req.body.password}' OR Email = '${req.body.email}'`;

    dataBase.query(sql, function (err, result) {
        if (err) throw err;

        if (result.length > 0) {

            var resultStr = ''

            resultStr += '<!DOCTYPE html>'
            resultStr += '<html>'
            resultStr += '<head>'

            resultStr += '<style>'

            resultStr += 'body {background-color: darkblue;'
            resultStr += 'font - family: Garamond;'
            resultStr += 'height: 100 %;'
            resultStr += 'overflow: auto;'
            resultStr += '}'

            resultStr += '.main_title {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 70px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'color: aqua;'
            resultStr += '}'

            resultStr += '.note {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 23px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'margin-top: 100px;'
            resultStr += 'color: yellow;'
            resultStr += '}'

            resultStr += '</style>'

            resultStr += '<meta charset="utf-8" />'
            resultStr += '<title>Register</title>'
            resultStr += '</head>'
            resultStr += '<body>'

            resultStr += '<div class="main_title">Register</div>'

            resultStr += '<div class="note">'
            resultStr += 'The account infromation that you have entered already exist.<br/>'
            resultStr += 'Try registering with a different information.'
            resultStr += "</div>"

            resultStr += '</body>'
            resultStr += '</html>'

            res.send(resultStr);
        }
        else {

           var insertSql = `INSERT INTO players (Username,Password,Email,BirthDate,Points) VALUES('${req.body.name}','${req.body.password}','${req.body.email}','${req.body.date}',0)`;

           dataBase.query(insertSql, function (err, result) {
               if (err) throw err;

               console.log("1 record inserted");

               // create reusable transporter object using the default SMTP transport
               let transporter = nodemailer.createTransport({
                   service: 'gmail',
                   auth: {
                       user: 'noreplybattleship101@gmail.com',
                       pass: 'BattleShip101'
                   }
               });

               var mailOptions = {
                   from: 'noreplybattleship101@gmail.com', // sender address
                   to: req.body.email, // list of receivers
                   subject: "Account Creation Confirmation", // Subject line
                   html: "Hello, <br/><br/> Your account was added successfully."
                       + "<br /><br/> Have a good day."

               };

               transporter.sendMail(mailOptions, function (error, info) {
                   if (error) {
                       console.log(error);
                   } else {
                       console.log('Email was sent successfully');
                   }
               });

               var resultStr = ''

               resultStr += '<!DOCTYPE html>'
               resultStr += '<html>'
               resultStr += '<head>'

               resultStr += '<style>'

               resultStr += 'body {background-color: darkblue;'
               resultStr += 'font - family: Garamond;'
               resultStr += 'height: 100 %;'
               resultStr += 'overflow: auto;'
               resultStr += '}'

               resultStr += '.main_title {'
               resultStr += "font-family: 'Trebuchet MS';"
               resultStr += 'font-size: 70px;'
               resultStr += 'height: 100px;'
               resultStr += 'width: 500px;'
               resultStr += 'text-decoration: double;'
               resultStr += 'text-align: center;'
               resultStr += 'margin-left: 420px;'
               resultStr += 'color: aqua;'
               resultStr += '}'

               resultStr += '.note {'
               resultStr += "font-family: 'Trebuchet MS';"
               resultStr += 'font-size: 23px;'
               resultStr += 'height: 100px;'
               resultStr += 'width: 500px;'
               resultStr += 'text-decoration: double;'
               resultStr += 'text-align: center;'
               resultStr += 'margin-left: 420px;'
               resultStr += 'margin-top: 100px;'
               resultStr += 'color: yellow;'
               resultStr += '}'

               resultStr += '</style>'

               resultStr += '<meta charset="utf-8" />'
               resultStr += '<title>Register</title>'
               resultStr += '</head>'
               resultStr += '<body>'

               resultStr += '<div class="main_title">Register</div>'

               resultStr += '<div class="note">'
               resultStr += 'Your infromation were successfully registered.<br/>'
               resultStr += 'Check your email address for a confirmation message.'
               resultStr += "</div>"

               resultStr += '</body>'
               resultStr += '</html>'

               res.send(resultStr);

            });
        }
    });

})

app.post('/InfoRestorationPage.html', (req, res) => { // Send username and password to player's email

    console.log(req.body.email)

    var resultStr = ''

    var sql = `SELECT Username, Password FROM players WHERE Email = '${req.body.email}'`;

    dataBase.query(sql, function (err, result) {
        if (err) throw err;

        if (result.length > 0) {

            console.log(result)

            // create reusable transporter object using the default SMTP transport
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'noreplybattleship101@gmail.com',
                    pass: 'BattleShip101'
                }
            });

            var mailOptions = {
                from: 'noreplybattleship101@gmail.com', // sender address
                to: req.body.email, // list of receivers
                subject: "Login Information Recovery", // Subject line
                html: "Hello, <br/> Here are your account login information: <br/><br/>"
                + "Username : " + result[0].Username + "<br/>" + "Password : " + result[0].Password // plain text body
                + "<br /><br/> Have a good day."
                    
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email was sent successfully');
                }
            });

            resultStr += '<!DOCTYPE html>'
            resultStr += '<html>'
            resultStr += '<head>'

            resultStr += '<style>'

            resultStr += 'body {background-color: darkblue;'
            resultStr += 'font - family: Garamond;'
            resultStr += 'height: 100 %;'
            resultStr += 'overflow: auto;'
            resultStr += '}'

            resultStr += '.main_title {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 70px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'color: aqua;'
            resultStr += '}'

            resultStr += '.note {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 23px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'margin-top: 100px;'
            resultStr += 'color: yellow;'
            resultStr += '}'

            resultStr += '</style>'

            resultStr += '<meta charset="utf-8" />'
            resultStr += '<title>Info Restoration</title>'
            resultStr += '</head>'
            resultStr += '<body>'

            resultStr += '<div class="main_title">Info Restoration</div >'

            resultStr += '<div class="note">'
            resultStr += 'Your username and password information were sent to your email successfully.<br/>'
            resultStr += 'Please check your email and try to login again.'
            resultStr += "</div>"

            resultStr += '</body>'
            resultStr += '</html>'

            res.send(resultStr);
        }

        else {
            console.log('no such email exists')

            resultStr += '<!DOCTYPE html>'
            resultStr += '<html>'
            resultStr += '<head>'

            resultStr += '<style>'

            resultStr += 'body {background-color: darkblue;'
            resultStr += 'font - family: Garamond;'
            resultStr += 'height: 100 %;'
            resultStr += 'overflow: auto;'
            resultStr += '}'

            resultStr += '.main_title {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 70px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'color: aqua;'
            resultStr += '}'

            resultStr += '.note {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 23px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'margin-top: 100px;'
            resultStr += 'color: yellow;'
            resultStr += '}'

            resultStr += '</style>'

            resultStr += '<meta charset="utf-8" />'
            resultStr += '<title>Info Restoration</title>'
            resultStr += '</head>'
            resultStr += '<body>'

            resultStr += '<div class="main_title">Info Restoration</div >'

            resultStr += '<div class="note">'
            resultStr += 'The email that you have entered is either wrong or does not exist.<br/>'
            resultStr += 'Please enter a correct email or create a new account.'
            resultStr += "</div>"

            resultStr += '</body>'
            resultStr += '</html>'

            res.send(resultStr);
        }
    });
})

app.post('/LeaderBoardsPage.html', function (req, res) { // Get leaderboards from database

    console.log(req.body.order)

    var sql;

    if (req.body.order === 'Ascending By Points') sql = `SELECT Username, Points FROM players ORDER BY Points ASC`;

    else if (req.body.order === 'Descending By Points') sql = `SELECT Username, Points FROM players ORDER BY Points DESC`;

    else if (req.body.order === 'Alphabetically Ascending') sql = `SELECT Username, Points FROM players ORDER BY Username ASC`;

    else sql = `SELECT Username, Points FROM players ORDER BY Username DESC`;

    dataBase.query(sql, function (err, result) {
        if (err) throw err;
        else {

            var resultStr = ''

            resultStr += '<!DOCTYPE html>'
            resultStr += '<html>'
            resultStr += '<head>'

            resultStr += '<style>'

            resultStr += 'body {background-color: darkblue;'
            resultStr += 'font - family: Garamond;'
            resultStr += 'height: 100 %;'
            resultStr += 'overflow: auto;'
            resultStr += '}'

            resultStr += '.main_title {'
            resultStr += "font-family: 'Trebuchet MS';"
            resultStr += 'font-size: 70px;'
            resultStr += 'height: 100px;'
            resultStr += 'width: 500px;'
            resultStr += 'text-decoration: double;'
            resultStr += 'text-align: center;'
            resultStr += 'margin-left: 420px;'
            resultStr += 'color: aqua;'
            resultStr += '}'

            resultStr += 'table.content-table {'
            resultStr += "font-family: 'Trebuchet MS';"

            resultStr += 'margin: 25px 380px;'
            resultStr += 'font-size:1.4em;'
            resultStr += 'min-width:400px;'
            resultStr += 'border-radius:10px 10px 0 0;'
            resultStr += 'overflow:hidden;'
            resultStr += 'box-shadow: 0 0 20px rgba(0,0,0,0.15);'
            resultStr += 'margin-left: auto;'
            resultStr += 'margin-right: auto;'
            resultStr += '}'

            resultStr += '.content-table thead tr {'
            resultStr += 'background-color: red;'
            resultStr += 'color: #ffffff;'
            resultStr += 'text-align: center;'
            resultStr += 'font-weight: bold;'
            resultStr += '}'

            resultStr += '.content-table th,.content-table td {'
            resultStr += 'padding: 15px 60px;'
            resultStr += '}'

            resultStr += '.content-table tbody tr {'
            resultStr += 'border-bottom: 1px solid #dddddd;'
            resultStr += '}'

            resultStr += '.content-table tbody tr{'
            resultStr += 'background-color: #f3f3f3;'
            resultStr += '}'

            resultStr += '.content-table tbody tr: last-of-type {'
            resultStr += 'border-bottom: 2px solid #009879;'
            resultStr += '}'

            resultStr += '</style>'

            resultStr += '<meta charset="utf-8" />'
            resultStr += '<title>LeaderBoards</title>'
            resultStr += '</head>'
            resultStr += '<body>'

            resultStr += '<div class="main_title">LeaderBoards</div >'

            resultStr += '<table class="content-table">'
            resultStr += '<thead>'
            resultStr += '<tr>'
            resultStr += '<th>Username</th>'
            resultStr += '<th>Points</th>'
            resultStr += '</tr>'
            resultStr += '</thead>'

            resultStr += '<tbody>'

            for (var key in result) {

                var elem = result[key]

                resultStr += '<tr>'

                resultStr += '<td>'
                resultStr += elem.Username
                resultStr += '</td >'

                resultStr += '<td>'
                resultStr += elem.Points
                resultStr += '</td >'

                resultStr += '<tr/>'
            }

            resultStr += '</tbody>'
            resultStr += '</table>'

            resultStr += '</body>'
            resultStr += '</html>'

            res.send(resultStr);
        }
    });
});

// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`))


// Handle a socket connection request from web client
const connections = [null, null]

io.on('connection', socket => {
  //console.log('New WS Connection')

    let playerIndex = -1
    // Find an available player number
    for (const i in connections) {
        if (connections[i] === null) {
            playerIndex = i
            playerNumber = playerIndex
            break
        }
    }

    // Tell the connecting client what player number they are
    socket.emit('player-number', playerIndex)

    console.log(`Player ${playerIndex} has connected`)

    // Ignore player 3
    if (playerIndex === -1) return

    connections[playerIndex] = false

    // Tell eveyone what player number just connected
    socket.broadcast.emit('player-connection', playerIndex)

    // Handle Diconnect
    socket.on('disconnect', () => {
        console.log(`Player ${playerIndex} disconnected`)
        connections[playerIndex] = null
        //Tell everyone what player numbe just disconnected
        socket.broadcast.emit('player-connection', playerIndex)
    })

    // On Ready
    socket.on('player-ready', () => {
        socket.broadcast.emit('enemy-ready', playerIndex)
        connections[playerIndex] = true
    })

    // Check player connections
    socket.on('check-players', () => {
        const players = []
        for (const i in connections) {
            connections[i] === null ? players.push({ connected: false, ready: false }) : players.push({ connected: true, ready: connections[i] })
        }
        socket.emit('check-players', players)
    })

    // On Fire Received
    socket.on('fire', id => {
        console.log(`Shot fired from ${playerIndex}`, id)

        // Emit the move to the other player
        socket.broadcast.emit('fire', id)
    })

    // on Fire Reply
    socket.on('fire-reply', square => {
        console.log(square)

        // Forward the reply to the other player
        socket.broadcast.emit('fire-reply', square)
    })

    // Timeout connection
    setTimeout(() => {
        connections[playerIndex] = null
        socket.emit('timeout')
        socket.disconnect()
    }, 600000) // 10 minute limit per player
})