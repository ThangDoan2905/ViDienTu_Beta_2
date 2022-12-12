const express = require("express");
const Wallet = require("../models/Wallet");
require("dotenv").config();
const router = express.Router();

router.get("/wallet/:walletId/wallet-information", (req, res) => {
    const walletId = req.params.walletId;
    Wallet.findOne({ walletId: walletId }, (err, result) => {
        if (err)
            res.send({
                status: "FAILED",
                message: "Something went wrong!",
                error: err,
            });
        else if (!result) 
            res.send({
                status: "FAILED",
                message: "No wallet found",
            });
        else {
            res.send({
                walletId: result.walletId,
                currencyUSD: result.currencyUSD,
                currencyVND: result.currencyVND,
            });
        }
    });
});

router.get("/wallet/:walletId/trade-history", (req, res) => {
    const walletId = req.params.walletId;
    
})

module.exports = router;