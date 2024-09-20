const mongoose = require('mongoose');

const regularMeetingSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    schedule: { type: String, required: true }, // 예: THU1630
});

module.exports = mongoose.model('RegularMeeting', regularMeetingSchema);