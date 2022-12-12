const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PerfectMoneySchema = new Schema({
    owner: {
        type: String,
        required: true,
        uppercase: true,
    },
    accountNumber: {
        type: String,
        required: true,
        unique: true,
    },
    userId: {
        type: String,
        required: true,
        unique: true,
    }
});

const PerfectMoney = mongoose.model("PerfectMoney", PerfectMoneySchema);
module.exports = PerfectMoney;