const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tech_reservationSchema = new Schema({
    time_start:{
        type: String,
        required: true,
    },
    time_end:{
        type: String,
        required: true,
    },
    technician:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    lab:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "labs",
        required: true,
    },
    date:{
        type: Date,
        required: true,
    },
    student:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    status:{
        type: String,
        enum: ['Scheduled', 'Cancelled', 'In Progress', 'Completed'],
        default: 'Scheduled',
    },
}, {timestamps: true});

module.exports = mongoose.model('tech_reservation', tech_reservationSchema);