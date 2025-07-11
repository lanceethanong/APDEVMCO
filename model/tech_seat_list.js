const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tech_seat_listSchema = new Schema({
    reservation:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "tech_reservation",
    },
    row:{
        type: mongoose.SchemaTypes.Int32,
        required: true,
    },
    column:{
        type: mongoose.SchemaTypes.Int32,
        required: true,
    }
}, {timestamps: true});

module.exports = mongoose.model('tech_seat_list', tech_seat_listSchema);