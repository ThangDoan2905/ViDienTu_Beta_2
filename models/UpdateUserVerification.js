const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UpdateUserVerificationSchema = new Schema({
    userId: String,
    uniqueString: String,
    createAt: Date,
    expireAt: Date,
});

const UpdateUserVerification = mongoose.model('UpdateUserVerification', UpdateUserVerificationSchema);

module.exports = UpdateUserVerification;