const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BankAccountSchema = new Schema({
    bankName: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
    },
    accountNumber: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    userId: {
        type: String,
        require: true,
        trim: true,
        unique: true,
    }
});

const BankAccount = mongoose.model("BankAccount", BankAccountSchema);
module.exports = BankAccount;