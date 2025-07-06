const mongoose = require('mongoose');

const uri = 'mongodb+srv://<password>-admin@cluster0.ndwtzr5.mongodb.net/lab_res_db?retryWrites=true&w=majority&appName=Cluster0';

module.exports = () => mongoose.connect(uri);
