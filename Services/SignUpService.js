const express = require("express");
const router = express.Router();
const User = require("./../models/User");
const BankAccount = require("./../models/BankAccount");
const PerfectMoney = require("./../models/PerfectMoney");
const CreateUserVerification = require("../models/CreateUserVerification");
const DeleteUserVerification = require("./../models/DeleteUserVerification");
const UpdateUserVerification = require("./../models/UpdateUserVerification");
const Wallet = require("./../models/Wallet");
require("dotenv").config();
const bcrypt = require("bcrypt");
const emailConfig = require("./../config/emailConfig");

const signupService = router.post("/signup", (req, res) => {
    
});