const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
var nodemailer = require('nodemailer');

const app = express();
app.use(cors({origin : 'localhost'}));
app.use(express.json());
app.use(express.static('public'));

const pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'roti'
});

let passwordResetCode = {};
let limitedHost = {};

//create user and login
app.post('/createUser', async (req, res) => {
    const data = req.body;

    const hashedPassword = await bcrypt.hash(data.password, 10).catch(err => {res.end()});
    pool.getConnection((err, connection) => {
        if(err) {
            res.json({msg : err});
        }
        const query = `insert into user values ('${data.username}','${hashedPassword}', '${data.email}', 0, 'user')`
        connection.query(query, (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
            } else {
                res.json({msg : 'account created'});
            }
        })
    })
});

app.post('/login', (req, res) => {
    const data = req.body;
    pool.getConnection((err, connection) => {
        if(err){
            res.json({msg : err});
        }
        connection.query(`select * from user where username='${data.username}'`, async (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
                return;
            }
            
            if(rows.length === 0){
                res.json({msg : 'username or password is not correct'});
                return;
            }
            
            const auth = await bcrypt.compare(data.password, rows[0].password);
            if(auth){
                const userInfo = {username : data.username, role : rows[0].role };
                const accessToken = jwt.sign(userInfo, process.env.secret);
                res.json({msg : 'logged in', accessToken : accessToken});

            }else{
                res.json({msg : 'username or password is not correct'});
            }

        })
    })    
})

//admin routes
app.get('/adminTransactions', (req, res) => {

});

app.post('/adminTransactions', (req, res) => {

})

app.post('/products', (req, res) => {

})

//user routes
app.post('/userTransactions', (req, res) => {

})

app.get('/userTransactions', (req, res) => {

});

//public routes
app.get('/products', (req, res) => {
    res.json('products');
})

app.post('/resetRequest', limit, (req, res) => {
    const data = req.body;
    const username = data.username;

    pool.getConnection((err, connection) => {
        if(err){
            res.json({msg : err});
        }
        connection.query(`select * from user where username='${username}'`, async (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
                return;
            }
            
            if(rows.length === 0){
                res.json({msg : 'username not found'});
                return;
            }

            const resetCode = Math.floor(100000 + Math.random() * 900000) + '';

            //send mail
            const transporter = nodemailer.createTransport({
                host: 'smtp.mail.yahoo.com',
                port: 465,
                service:'yahoo',
                secure: false,
                auth: {
                user: process.env.adminEmail,
                pass: process.env.adminEmailPass
                }
            });
            
            const mailOptions = {
                from: process.env.adminEmail,
                to: rows[0].email,
                subject: 'Password reset code',
                text: `your reset code : ${resetCode}`
            };
            
            transporter.sendMail(mailOptions, function(err, info){
            if (err) {
                console.log(err);
                res.json({msg : 'failed to send email'});
                return;
            } else {
                res.json({msg : 'Email sent'});
            }
            });

            passwordResetCode[username] = resetCode;
            console.log(passwordResetCode);
        })
    })    

});

app.post('/resetPassword', async (req, res) => {
    const data = req.body;
    const username = data.username;

    if(!(username in passwordResetCode)){
        res.json({msg : 'username not found!'});
        return;
    }

    if(data.resetCode != passwordResetCode.username){
        res.json({msg : 'reset code is not valid'});
        return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10).catch(err => {res.json({msg : 'server error'});res.end()});

    pool.getConnection((err, connection) => {
        if(err){
            res.json({msg : err});
        }
        connection.query(`update user set password='${hashedPassword}' where username='${username}'`, async (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
                return;
            }
            
            if(rows.length === 0){
                res.json({msg : 'username not found'});
                return;
            }
            
            delete passwordResetCode['username'];
            res.json({msg : 'password changed!'});
        })
    })    

})

//middlewares
function authorizeAdmin(req, res, next){

}

function authorizeUser(req, res, next){

}

function limit(req, res, next){
    const host = req.headers.host;
    if(host in limitedHost){
        console.log(`${host} limited`);
        res.status(403).end();
    }else{
        limitedHost[`${host}`] = host;
        setTimeout(() => delete limitedHost[`${host}`], 60 * 1000);
        next();
    }
} 

app.listen(3000, () => console.log('server ready at :3000'));