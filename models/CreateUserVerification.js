const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CreateUserVerificationSchema = new Schema({
    userId: String,
    uniqueString: String,
    createAt: Date,
    expireAt: Date,
});

const CreateUserVerification = mongoose.model('CreateUserVerification', CreateUserVerificationSchema);

module.exports = CreateUserVerification;