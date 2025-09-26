
const mongoose =require('mongoose');

const EventSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true, maxlength: 40},
    description: {type: String, trim: true, maxlength: 200, default: ''},
    amount: {type: Number, required: true, min: 0 },
    type: {type: String, required: true, enum: ['ingreso', 'egreso'], index: true},
    date: {type: Date, required: true, index: true}
}, {
    timestamps: true,
    versionKey: false
});

EventSchema.index({date: -1});

module.exports = mongoose.model('Event', EventSchema);
