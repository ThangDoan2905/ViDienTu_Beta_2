const express = require("express");
const router = express.Router();
const BankAccount = require("./../models/BankAccount");
const User = require("./../models/User");
require("dotenv").config();

router.post("/users/:userId/add-bank-account", (req, res) => {
  var id = req.params.userId;
  var { bankName, owner, accountNumber } = req.body;
  const bank = {
    bankName: bankName,
    owner: owner,
    accountNumber: accountNumber,
  };
  User.findById(id, (err, data) => {
    if (err)
      res.send({
        STATUS: "FAILED",
        message: "Something went wrong while checking for existing user!",
      });
    else if (!data)
      res.send({
        STATUS: "FAILED",
        message: "User with provided id not found!",
      });
    else {
      BankAccount.find({ userId: id }, (err, doc) => {
        if (doc.length) {
          res.send({
            STATUS: "FAILED",
            message: "Only one bank account for one user!",
          });
        } else if (err) {
          res.send({
            STATUS: "FAILED",
            message:
              "Something went wrong while checking for existing bank account of this user!",
          });
        } else {
          BankAccount.create({
            bankName: bankName,
            owner: owner,
            accountNumber: accountNumber,
            userId: id,
          })
            .then(() => {
              res.send({
                STATUS: "SUCCESS",
                message: "Add bank account successful!",
                user: {
                  name: data["name"],
                  email: data["email"],
                },
                bank: bank,
              });
            })
            .catch((err) => {
              res.send({
                status: "FAILED",
                message: "Something went wrong!",
                error: err["message"],
              });
            });
        }
      });
    }
  });
});
router.get("/users/:userId/bank-account-information", (req, res) => {
    const id = req.params.userId;
    BankAccount.find({ userId: id }, (err, data) => {
        if(err) 
            res.send({
                status: "FAILED",
                message: "Something went wrong while checking bank account information",
                error: err,
            });
        else if (!data.length) 
            res.send({
                status: "FAILED",
                message: "Can not find bank account information of this user",
            });
        else {
            res.send({
                status: "INFORMATION",
                data: data,
            })
        }
    })
})
router.put("/users/:userId/update-bank-account", (req, res) => {
  const id = req.params.userId;
  var { bankName, accountNumber, owner } = req.body;
  User.findById(id, (err, data) => {
    if (err)
      res.send({
        status: "FAILED",
        message: "Something went wrong while checking for existing user!",
      });
    else if (!data)
      res.send({
        status: "FAILED",
        message: "User not found!",
      });
    else {
      BankAccount.findOneAndUpdate(
        { userId: id },
        {
          $set: {
            bankName: bankName,
            owner: owner,
            accountNumber: accountNumber,
          },
        },
        (err, updatedDoc) => {
          if (err) {
            console.log(err);
            res.send({
              status: "FAILED",
              message:
                "Something went wrong while checking for existing bank account record of the user with provided id",
            });
          } else if (!updatedDoc)
            res.send({
              status: "FAILED",
              message: "Record with provided userId not found",
            });
          else {
            BankAccount.findOne({ userId: id }, (err, doc) => {
              res.send({
                status: "SUCCESS",
                message: "Update completed",
                updatedDoc: doc,
              });
            });
          }
        }
      );
    }
  });
});

router.delete("/users/:userId/delete-bank-account", (req, res) => {
  const id = req.params.userId;
  BankAccount.find({ userId: id }, (err, data) => {
    if (err)
      res.send({
        status: "FAILED",
        message:
          "Something went wrong while checking for existing bank account!",
      });
    else if (!data.length)
      res.send({
        status: "FAILED",
        message: "No bank account found!",
      });
    else {
      BankAccount.deleteOne({ userId: id })
        .then(() => {
          res.send({
            status: "SUCCESS",
            message: "Delete bank account complete",
          });
        })
        .catch((err) => {
          res.send({
            status: "FAILED",
            message:
              "Something went wrong while deleting bank account of this user",
            error: err,
          });
        });
    }
  });
});

module.exports = router;
