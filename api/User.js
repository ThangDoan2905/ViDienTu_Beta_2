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
const generateWalletId = require("./../Services/GenerateWalletIdService");

console.log(generateWalletId() + " test");
// async function generateWId() {
//   try {
//     let walletId = ((Math.random() + 0.1) * 100000000000).toString().substring(0, 10);
//     let findWId = await User.find({ walletId: walletId });
//     do {
//       walletId = ((Math.random() + 0.1) * 100000000000).toString().substring(0, 10);
//       findWId = await User.find({ walletId: walletId });
//     } while(findWId.length > 0);
//     return walletId;
//   }
//   catch(error) {
//     console.log(error);
//   }
// };
// let wId;
// Promise.all([generateWId()]).then((values) => {
//   wId = values[0];
// })
router.post("/signup", (req, res) => {
  var {
    name,
    username,
    email,
    password,
    dateOfBirth,
    gender,
    address,
    city,
    country,
    zipCode,
    walletId,
  } = req.body;
  if (
    name == "" ||
    email == "" ||
    username == "" ||
    password == "" ||
    dateOfBirth == ""
  ) {
    res.send({
      status: "FAILED",
      message: "Empty input fields",
    });
  } else if (!/^[a-zA-Z ]*$/.test(name)) {
    res.send({
      status: "FAILED",
      message: "Invalid name entered",
    });
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    res.send({
      status: "FAILED",
      message: "Invalid email entered",
    });
  } else if (!new Date(dateOfBirth).getTime()) {
    res.send({
      status: "FAILED",
      message: "Invalid date entered",
    });
  } else if (password.length < 8) {
    res.send({
      status: "FAILED",
      message: "Password is too short",
    });
  } else if (
    !/^[a-zA-Z0-9\s,'-]*$/.test(address) ||
    !/^[a-zA-Z ]*$/.test(city) ||
    !/^[a-zA-Z ]*$/.test(country)
  ) {
    res.send({
      status: "FAILED",
      message: "Invalid address entered",
    });
  } else if (/^(\d{6})$/.test(zipCode)) {
    res.send({
      status: "FAILED",
      message: "Invalid Zip code entered",
    });
  } else {
    User.findOne({ username: username })
      .then((result) => {
        if (result) {
          res.send({
            status: "FAILED",
            message: "Username already exists",
          });
        } else {
          User.findOne({ email: email })
            .then((eresult) => {
              if (eresult) {
                res.send({
                  status: "FAILED",
                  message: "Email already exists",
                });
              } else {
                //encrypt password to save into database
                console.log(wId);
                const saltRounds = 10;
                bcrypt
                  .hash(password, saltRounds)
                  .then((hashedPassword) => {
                    const newUser = new User({
                      name,
                      username,
                      email,
                      password: hashedPassword,
                      dateOfBirth,
                      gender,
                      address,
                      city,
                      country,
                      zipCode,
                      walletId: wId,
                    });

                    newUser
                      .save()
                      .then((result) => {
                        emailConfig.sendVerificationCreate(result, res);
                      })
                      .then(() => {
                        let walletId = wId
                        let currencyUSD = 0;
                        let currencyVND = 0;
                        
                        wallet = { 
                          walletId: walletId,
                          currencyUSD: currencyUSD,
                          currencyVND: currencyVND,
                          userId: newUser._id,
                        }
                        Wallet.create(wallet);
                      })
                      .catch((err) => {
                        res.send({
                          status: "FAILED",
                          message:
                            "An error occurred while saving user account",
                          error: err,
                        });
                      });
                  })
                  .catch((err) => {
                    res.send({
                      status: "FAILED",
                      message: "An error occurred while hashing password",
                      error: err,
                    });
                  });
              }
            })
            .catch((error) => {
              console.log(error);
              res.send({
                status: "FAILED",
                message: "An error occured while checking for existing email",
              });
            });
        }
      })
      .catch((error) => {
        console.log(error);
        res.send({
          status: "FAILED",
          message: "An error occured while checking for existing username",
        });
      });
  }
});

router.get("/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;

  CreateUserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        const { expireAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;
        if (expireAt < Date.now()) {
          //if verification request is expired, delete verification record, and delete unverified account
          CreateUserVerification.deleteOne({ userId })
            .then((result) => {
              User.deleteOne({ _id: userId })
                .then(() => {
                  let message = "Link has expired. Please sign up again.";
                  res.send({
                    status: "FAILED",
                    message: message,
                  });
                })
                .catch((error) => {
                  console.log(error);
                  let message =
                    "Clearing user with expired unique string failed";
                  res.send({
                    status: "FAILED",
                    message: message,
                  });
                });
            })
            .catch((error) => {
              console.log(error);
              let message =
                "An error occurred while clearing expired user verification record";
              res.send({
                status: "FAILED",
                message: message,
              });
            });
        } else {
          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                //if verification request success, update status isVerified of the account into true, delete record verification request of this account in database
                User.updateOne({ _id: userId }, { isVerified: true })
                  .then(() => {
                    CreateUserVerification.deleteOne({ userId })
                      .then(() => {
                        res.send({
                          status: "SUCCESS",
                          message: "Your account has been verified successfully!",
                        });
                      })
                      .catch((error) => {
                        console.log(error);
                        let message =
                          "An error occurred while finalizing successful verification.";
                        res.send({
                          status: "FAILED",
                          message: message,
                        });
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    let message =
                      "An error occurred while updating user record to show verified.";
                    res.send({
                      status: "FAILED",
                      message: message,
                    });
                  });
              } else {
                let message =
                  "Invalid verification details passed. Check your inbox.";
                res.send({
                  status: "FAILED",
                  message: message,
                });
              }
            })
            .catch((error) => {
              console.log(error);
              let message = "An error occured while comparing unique strings.";
              res.send({
                status: "FAILED",
                message: message,
              });
            });
        }
      } else {
        let message =
          "Account record does not exist or has been verified already. Please sign up or log in";
        res.send({
          status: "FAILED",
          message: message,
        });
      }
    })
    .catch((error) => {
      console.log(error);
      let message =
        "An error occurred while checking for existing user verification record";
      res.send({
        status: "FAILED",
        message: message,
      });
    });
});

router.post("/signin", (req, res) => {
  let { username, password } = req.body;
  if (username == "" || password == "") {
    res.send({
      status: "FAILED",
      message: "Empty credentials supplied",
    });
  } else {
    User.find({ username })
      .then((data) => {
        //Check if this loged in account is an administrator account, if true redirect to admin
        if (data[0].isAdministrator) {
          const hashedPassword = data[0].password;
          bcrypt
            .compare(password, hashedPassword)
            .then((result) => {
              if (result) {
                User.find({})
                  .then((result) => {
                    res.send({
                      status: "SUCCESS",
                      message: "Administrator sign in successfully!",
                      userData: result,
                    })
                  })
              } else {
                res.send({
                  status: "FAILED",
                  message: "Invalid password entered",
                });
              }
            })
            .catch((err) => {
              res.send({
                status: "FAILED",
                message: "An error occurred while comparing password",
                error: err,
              });
            });
        } else {
          if (data.length) {
            //check verified account
            if (!data[0].isVerified) {
              emailConfig.sendVerificationCreate(data[0], res);
              // res.send({
              //   status: "FAILED",
              //   message: "Email has not been verified yet. Check your inbox.",
              // });
              
            } else {
              const hashedPassword = data[0].password;
              bcrypt
                .compare(password, hashedPassword)
                .then((result) => {
                  if (result) {
                    res.send({
                      status: "SUCCESS",
                      message: "Signin successful",
                      data: data,
                    });
                  } else {
                    res.send({
                      status: "FAILED",
                      message: "Invalid password entered",
                    });
                  }
                })
                .catch((err) => {
                  res.send({
                    status: "FAILED",
                    message: "An error occurred while comparing password",
                    error: err,
                  });
                });
            }
          } else {
            res.send({
              status: "FAILED",
              message: "Invalid credentials entered",
            });
          }
        }
      })
      .catch((err) => {
        res.send({
          status: "FAILED",
          message: "An error occurred while checking for existing user",
        });
      });
  }
});

router.get("/users/:userId/user-information", (req, res) => {
  const id = req.params.userId;
  User.findOne({ _id: id }, (err, data) => {
    if (err) return null;
    else {
      res.send({
        status: "USER INFORMATION",
        userData: data,
      });
    }
  });
});

router.put("/users/:userId/update", (req, res) => {
  //update
  //if update email send verification
  //or
  //send confirm verification email every time request update
  //check email in use or not
  const id = req.params.userId;
  var {
    name,
    email,
    password,
    dateOfBirth,
    gender,
    address,
    city,
    country,
    zipCode,
  } = req.body;

  if (!/^[a-zA-Z ]*$/.test(name)) {
    res.send({
      status: "FAILED",
      message: "Invalid name entered",
    });
  } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    res.send({
      status: "FAILED",
      message: "Invalid email entered",
    });
  } else if (!new Date(dateOfBirth).getTime()) {
    res.send({
      status: "FAILED",
      message: "Invalid date entered",
    });
  } else if (password.length < 8) {
    res.send({
      status: "FAILED",
      message: "Password is too short",
    });
  } else if (
    !/^[a-zA-Z0-9\s,'-]*$/.test(address) ||
    !/^[a-zA-Z ]*$/.test(city) ||
    !/^[a-zA-Z ]*$/.test(country)
  ) {
    res.send({
      status: "FAILED",
      message: "Invalid address entered",
    });
  } else if (/^(\d{6})$/.test(zipCode)) {
    res.send({
      status: "FAILED",
      message: "Invalid Zip code entered",
    });
  } else {
    const saltRounds = 10;
    bcrypt
      .hash(password, saltRounds)
      .then((hashedPassword) => {
        User.findByIdAndUpdate(id, {
          $set: {
            name: name,
            email: email,
            password: hashedPassword,
            dateOfBirth: dateOfBirth,
            gender: gender,
            address: address,
            city: city,
            country: country,
            zipCode: zipCode,
            isVerified: false,
          },
        })
          .then((result) => {
            console.log(result);
            emailConfig.sendVerificationUpdate(result, res);
          })
          .catch((error) => {
            res.send({
              status: "FAILED",
              message: "Update failed",
              error: error,
            });
          });
      })
      .catch((err) => {
        res.send({
          status: "FAILED",
          message: "An error occurred while hashing password",
          error: err,
        });
      });
  }
});
router.get("/verify-update/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;

  UpdateUserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        const { expireAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;
        if (expireAt < Date.now()) {
          UpdateUserVerification.deleteOne({ userId })
            .then(() => {
              let message = "Link has expired. Please try again.";
              res.send({
                status: "FAILED",
                message: message,
              });
            })
            .catch((error) => {
              console.log(error);
              let message =
                "An error occurred while clearing expired update user verification record";
              res.send({
                status: "FAILED",
                message: message,
              });
            });
        } else {
          bcrypt.compare(uniqueString, hashedUniqueString).then((result) => {
            if (result) {
              UpdateUserVerification.deleteOne({ userId: userId })
                .then(() => {
                  User.updateOne({ _id: userId }, { isVerified: true }).then(
                    () => {
                      User.findById(userId, (err, doc) => {
                        res.send({
                          status: "SUCCESS",
                          message: "Update user completed",
                          updatedData: doc,
                        });
                      });
                    }
                  );
                })
                .catch(() => {
                  let message =
                    "An error occurred while finalizing successful updating your account.";
                  res.send({
                    status: "FAILED",
                    message: message,
                  });
                });
            } else {
              let message =
                "Invalid update verification details passed. Check your inbox.";
              res.send({
                status: "FAILED",
                message: message,
              });
            }
          });
        }
      } else {
        let message =
          "Account record does not exist or has been updated already. Please check again.";
        res.send({
          status: "FAILED",
          message: message,
        });
      }
    })
    .catch((error) => {
      console.log(error);
      let message =
        "An error occurred while checking for existing delete verification record";
      res.send({
        status: "FAILED",
        message: message,
      });
    });
});

router.get("/verify-delete/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;

  DeleteUserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        const { expireAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;
        if (expireAt < Date.now()) {
          DeleteUserVerification.deleteOne({ userId })
            .then((result) => {
              let message = "Link has expired. Please try again.";
              res.send({
                status: "FAILED",
                message: message,
              });
            })
            .catch((error) => {
              console.log(error);
              let message =
                "An error occurred while clearing expired user verification record";
              res.send({
                status: "FAILED",
                message: message,
              });
            });
        } else {
          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                DeleteUserVerification.deleteOne({ userId: userId })
                  .then(() => {
                    User.deleteOne({ _id: userId })
                      .then(() => {
                        BankAccount.deleteOne({ userId: userId })
                          .then(() => {
                            PerfectMoney.deleteOne({ userId: userId })
                              .then(() => {
                                res.send({
                                  status: "SUCCESS",
                                  message:
                                    "Your account has been deleted successfully.",
                                });
                              })
                              .catch(() => {
                                let message =
                                  "An error occurred while finalizing successful deleting your account.";
                                res.send({
                                  status: "FAILED",
                                  message: message,
                                });
                              });
                          })
                          .catch(() => {
                            let message =
                              "An error occurred while finalizing successful deleting your account.";
                            res.send({
                              status: "FAILED",
                              message: message,
                            });
                          });
                      })
                      .catch((error) => {
                        console.log(error);
                        let message =
                          "An error occurred while finalizing successful deleting your account.";
                        res.send({
                          status: "FAILED",
                          message: message,
                        });
                      });
                  })
                  .catch((err) => {
                    console.log(err);
                    let message =
                      "An error occurred while deleting your account.";
                    res.send({
                      status: "FAILED",
                      message: message,
                    });
                  });
              } else {
                let message =
                  "Invalid delete verification details passed. Check your inbox.";
                res.send({
                  status: "FAILED",
                  message: message,
                });
              }
            })
            .catch((error) => {
              let message = "Ann error occured while comparing unique strings.";
              res.send({
                status: "FAILED",
                message: message,
              });
            });
        }
      } else {
        let message =
          "Account record does not exist or has been delete already. Please check again.";
        res.send({
          status: "FAILED",
          message: message,
        });
      }
    })
    .catch((error) => {
      console.log(error);
      let message =
        "An error occurred while checking for existing delete verification record";
      res.send({
        status: "FAILED",
        message: message,
      });
    });
});

router.delete("/users/:userId/delete-account", (req, res) => {
  const id = req.params.userId;
  //check valid user id
  //send email to verify delete request
  //click link below to confirm delete
  //delete completed
  User.find({ _id: id })
    .then((result) => {
      emailConfig.sendVerificationDelete(result[0], res);
    })
    .catch((err) => {
      res.send({
        status: "FAILED",
        message: "An error occurred while deleting your account!",
      });
    });
});

router.post("/test", async (req, res) => {
  let wid = req.body.walletId;
  let findWId = await User.find({ walletId: wid });
  if (findWId) {
    console.log(typeof(findWId));
    console.log(wid);
    console.log(findWId.length)
    res.send({
      data: findWId,
    })
  }
});
module.exports = router;