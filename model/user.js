const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email:{
        type: String,
        required: true,
        unique: true, 
        lowercase: true,
    },
    firstName:{
        type: String,
        required: true,
    },
    lastName:{
        type: String,
        required: true,
    },
    description: String,
    remember: Boolean,
    password:{
        type: String,
        required: true,
    },
    picture:{
        type: String,
        required: true,
    },
    role:{
        type: String,
        enum: ['Student', 'Lab Technician'],
    }
});

module.exports = mongoose.model('User', userSchema);
