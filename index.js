const express = require('express');
const app = express();
const connection = require('./db')
app.get('/', (req,res) => {
    res.send("MUSIC");
});

connection()
.then(data =>{
    console.log('db connection succeeded');
    app.listen(3000, () =>{
    console.log('server started at 3000');
    }).on('error', err => console.log('server ignition failed', err));
})
.catch(err => console.log('error in connecting db\n:', err))