const express = require("express");
const { update } = require("../models/CreateUserVerification");
const router = express.Router();

const PerfectMoney = require("./../models/PerfectMoney");
const User = require("./../models/User");

require("dotenv").config();

router.post("/users/:userId/add-perfect-money-account", (req, res) => {
  var id = req.params.userId;
  var { owner, accountNumber } = req.body;
  const perfectMoney = {
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
      PerfectMoney.find({ userId: id }, (err, doc) => {
        if (doc.length) {
          res.send({
            STATUS: "FAILED",
            message: "Only one perfect money account for one user!",
          });
        } else if (err) {
          res.send({
            STATUS: "FAILED",
            message:
              "Something went wrong while checking for existing perfect money account of this user!",
          });
        } else {
          PerfectMoney.create({
            owner: owner,
            accountNumber: accountNumber,
            userId: id,
          })
            .then(() => {
              res.send({
                STATUS: "SUCCESS",
                message: "Add perfect money account successful!",
                user: {
                  name: data["name"],
                  email: data["email"],
                },
                perfectMoney: perfectMoney,
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

router.put("/users/:userId/update-perfect-money-account", (req, res) => {
  const id = req.params.userId;
  var { owner, accountNumber } = req.body;
  User.find({ _id: id }, (err, data) => {
    if (err)
      res.send({
        status: "FAILED",
        message: "Something went wrong while checking for existing users!",
        error: err,
      });
    else if (!data.length)
      res.send({
        status: "FAILED",
        message: "User with provided id not found!",
      });
    else {
      PerfectMoney.findOneAndUpdate(
        { userId: id },
        { $set: { owner: owner, accountNumber: accountNumber } },
        (err, updatedDoc) => {
          if (err)
            res.send({
              status: "FAILED",
              message:
                "Something went wrong while checking for existing Perfect money account!",
              error: err,
            });
          else if (!updatedDoc)
            res.send({
              status: "FAILED",
              message: "Record with the provided userId not found!",
            });
          else {
            PerfectMoney.findOne({ userId: id }, (err, result) => {
              res.send({
                status: "SUCCESS",
                message: "Update completed",
                updatedDoc: result,
              });
            });
          }
        }
      );
    }
  });
});

router.delete("/users/:userId/delete-perfect-money-account", (req, res) => {
  const id = req.params.userId;
  PerfectMoney.find({ userId: id }, (err, data) => {
    if (err)
      res.send({
        status: "FAILED",
        message:
          "Something went wrong while checking for exist perfect money account",
        error: err,
      });
    else if (!data.length)
      res.send({
        status: "FAILED",
        message:
          "Perfect money account of this userId does not exist or has been deleted",
      });
    else {
      PerfectMoney.deleteOne({ userId: id })
        .then(() => {
          res.send({
            status: "SUCCESS",
            message: "Delete completed",
          });
        })
        .catch((err) => {
          res.send({
            status: "FAILED",
            message:
              "Something went wrong while deleting perfect money account",
            error: err,
          });
        });
    }
  });
});
module.exports = router;
/*
module.exports = router;
catch(err => {
    res.send({
        status: "FAILED",
        message: "Something went wrong while creating new perfect money account"
    })
})
*/
