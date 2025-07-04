const mongoose = require('mongoose');

const uri = 'mongodb+srv://admin:<db_password>@cluster0.ndwtzr5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

module.exports = () => mongoose.connect(uri);
