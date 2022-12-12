const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const WalletSchema = new Schema({
    walletId: {
        type: String,
        unique: true,
        require: true,
    },
    currencyUSD: {
        type: Number,
    },
    currencyVND: {
        type: Number,
    },
    userId: {
        type: String,
        unique: true,
        require: true,
    }
});

const Wallet = mongoose.model("Wallet", WalletSchema);

module.exports = Wallet;