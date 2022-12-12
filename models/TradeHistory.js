const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tradeHistorySchema = new Schema({
    tradeType: {
        type: String,

    },
    moneyType: {
        
    },
    tradeAmount: {

    },
    accountBalance: {

    },
    tradeDate: {

    },
    tradeStatus: {

    }
})