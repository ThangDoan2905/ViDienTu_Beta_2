const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DeleteUserVerificationSchema = new Schema({
    userId: String,
    uniqueString: String,
    createAt: Date,
    expireAt: Date,
});

const DeleteUserVerification = mongoose.model('DeleteUserVerification', DeleteUserVerificationSchema);

module.exports = DeleteUserVerification;