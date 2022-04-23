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
        const query = `insert into user values ('${data.username}','${hashedPassword}', '${data.email}', 'user', '${data.address}')`
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
                const userInfo = {username : data.username, email : rows[0].email, address : rows[0].address, role : rows[0].role};
                const accessToken = jwt.sign(userInfo, process.env.secret);
                res.json({msg : 'logged in', role: rows[0].role, accessToken : accessToken});

            }else{
                res.json({msg : 'username or password is not correct'});
            }

        })
    })    
})

//admin routes
app.get('/adminTransactions', authorizeAdmin, (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) {
            res.json({msg : err});
        }
        const query = `select * from transaction`;

        connection.query(query, (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
            } else {
                res.json(rows);
            }
        })
    })
});

app.post('/adminTransactions', authorizeAdmin, (req, res) => {
    const data = req.body;
    const query = {insert : `insert into transaction values (default,'${data.user}', '${data.product}', '${data.quantity}', 1, '${new Date().toISOString().slice(0, 19).replace('T', ' ')}')`,
    edit : `update transaction set status='${data.status}' where id='${data.id}'`,
    delete : `delete from transaction where id=${data.id}`};
    pool.getConnection((err, connection) => {
        if(err) {
            res.json({msg : err});
        }

        connection.query(query[data.operation], (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
            } else {
                res.json({msg : "edit data success"});
            }
        })
    })
})

app.post('/Products', authorizeAdmin, (req, res) => {
    const data = req.body;
    const query = {insert : `insert into product values ('${data.name}','${data.price}', '${data.stock}')`,
    edit : `update product set name='${data.name}', price ='${data.price}', stock='${data.stock}' where name='${data.name}'`,
    delete : `delete from product where name=${data.name}`};

    pool.getConnection((err, connection) => {
        if(err) {
            res.json({msg : err});
        }

        connection.query(query[data.operation], (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
            } else {
                res.json({msg : "update data success"});
            }
        })
    })
})

//user routes
app.post('/userTransactions', authorizeUser, (req, res) => {
    const data = req.body;
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toString().slice(16, 24);
    const dateTime = `${date} ${time}`;
    const query = {insert : `insert into transaction values (default,'${data.user}', '${data.product}', '${data.quantity}', 1, '${dateTime}')`,
    edit : `update transaction set status='${data.status}' where id='${data.id}'`};

    pool.getConnection((err, connection) => {
        if(err) {
            res.json({msg : err});
        }

        connection.query(query[data.operation], (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
            } else {
                res.json({msg : "insert data success"});
            }
        })
    })
})


app.get('/userTransactions', authorizeUser, (req, res) => {
    pool.getConnection((err, connection) => {
        if(err) {
            res.json({msg : err});
        }
        const query = `select * from transaction where user='${req.username}'`;

        connection.query(query, (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
            } else {
                res.json(rows);
            }
        })
    })

});

app.post('/userData', authorizeUser, async (req, res) => {
    const data = req.body;
    const hashedPassword = await bcrypt.hash(data.password, 10).catch(err => {res.json({msg : 'server error'});res.end()});
    const query = `update user set password='${hashedPassword}', email='${data.email}', address='${data.address}' where username='${data.username}'`;

    pool.getConnection((err, connection) => {
        if(err) {
            res.json({msg : err});
        }

        connection.query(query, (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
            } else {
                res.json({msg : "insert data success"});
            }
        })
    })
})

app.get('/userData', authorizeUser, async (req, res) => {
    const data = req.headers;
    const query = `select * from user where username='${data.username}'`;

    pool.getConnection((err, connection) => {
        if(err) {
            res.json({msg : err});
        }

        connection.query(query, (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
            } else {
                res.json({username : rows[0].username, email : rows[0].email, address : rows[0].address, role : rows[0].role});
            }
        })
    })
})

//public routes
app.get('/products', (req, res) => {
    pool.getConnection((err, connection) => {
        if(err){
            res.json({msg : err});
        }
        connection.query(`select * from product`, async (err, rows) => {
            connection.release();
            if (err) {
                res.json({msg : err});
            }
            res.json(rows);
        })
    })
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
                res.json({msg : 'failed to send email'});
                return;
            } else {
                res.json({msg : 'Email sent'});
            }
            });

            passwordResetCode[username] = resetCode;
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

    if(data.code != passwordResetCode[username]){
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

app.get('/tokenData', (req, res) => {
    jwt.verify(req.headers.token, process.env.secret, (err, userData) => {
        if(err){
            return res.status(500).end();
        }
        res.json(userData);
    })
})

//middlewares
function authorizeAdmin(req, res, next){
    const token = req.headers.token;
    if(!(token)){
        return res.status(403).end();
    }
    jwt.verify(token, process.env.secret, (err, userData) => {
        if(err){
            return res.status(500).end();
        }
        if(userData.role != 'admin'){
            return res.status(403).end();
        }
        req.username = userData.username;
        next();
    })
}

function authorizeUser(req, res, next){
    const token = req.headers.token;
    if(!(token)){
        return res.status(403).end();
    }
    jwt.verify(token, process.env.secret, (err, userData) => {
        if(err){
            return res.status(500).end();
        }
        if(userData.role != 'user'){
            return res.status(403).end();
        }
        req.username = userData.username;
        next();
    })
}

function limit(req, res, next){
    const host = req.headers.host;
    if(host in limitedHost){
        res.status(403).end();
    }else{
        limitedHost[`${host}`] = host;
        setTimeout(() => delete limitedHost[`${host}`], 60 * 1000);
        next();
    }
}


app.listen(3000, () => console.log('server ready at :3000'));