const express = require('express');
const app = express();
const connection = require('./db')
app.get('/', (req,res) => {
    res.send("I AM MUSIC");
});

connection()
.then(data =>{
    console.log('db connection succeeded');
    app.listen(3000, () =>{
    console.log('server started at 3000');
    }).on('error', err => console.log('server ignition failed', err));
    Lab.deleteOne({ class: CCPROG3}), err=>{
        if(err) return err;
        console.log('saved');
    };
})
.catch(err => console.log('error in connecting db\n:', err))