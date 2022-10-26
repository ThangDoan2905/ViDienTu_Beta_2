const express = require("express");
const router = express.Router();

const User = require("./../models/User");

const UserVerification = require("./../models/UserVerification");

const nodemailer = require("nodemailer");

const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const path = require("path");

const bcrypt = require("bcrypt");
const e = require("express");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});

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
  } = req.body;
  // name = name.trim();
  // email = email.trim();
  // username = username.trim();
  // password = password.trim();
  // dateOfBird = dateOfBird.trim();
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
  }
  // else if(gender != "Male" || gender != "Female"){
  //     res.send({
  //         status: "FAILED",
  //         message: "Invalid gender entered"
  //     })
  // }
  else {
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.send({
            status: "FAILED",
            message: "User with the provided email already exists",
          });
        } else {
          User.find({ username }).then((result) => {
            if (result.length) {
              res.send({
                status: "FAILED",
                message: "User with the provided username already exists",
              });
            } else {
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
                    isVerified: false,
                  });

                  newUser
                    .save()
                    .then((result) => {
                      sendVerificationEmail(result, res);
                    })
                    .catch((err) => {
                      res.send({
                        status: "FAILED",
                        message: "An error occurred while saving user account",
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
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.send({
          status: "FAILED",
          message: "An error occured while checking for existing user!",
          error: err,
        });
      });
  }
});

const sendVerificationEmail = ({ _id, email }, res) => {
  const currentUrl = "https://damp-inlet-29952.herokuapp.com/";

  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Your Account",
    html: `<p>Verify your email address to complete the signup and login into your account.</p>
      <p>This link will be <b>expired in 6 hours</b>.</p>
      <p>Press <a href=${
        currentUrl + "verify/" + _id + "/" + uniqueString
      }>here</a> to process.</p>
      <p>id: ${_id}</p>
      <p>uniqueString: ${uniqueString}</p>`,
  };

  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      const newVerification = new UserVerification({
        userId: _id,
        uniqueString: hashedUniqueString,
        createAt: Date.now(),
        expireAt: Date.now() + 21600000,
      });

      newVerification
        .save()
        .then(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => {
              res.send({
                status: "PENDING",
                message: "Verification email sent!",
              });
            })
            .catch((error) => {
              console.lig(error);
              res.send({
                message: "FAILED",
                status: "Verification email failed",
              });
            });
        })
        .catch((error) => {
          res.send({
            status: "FAILED",
            message: "Could not save verification email data!",
          });
        });
    })
    .catch(() => {
      res.send({
        status: "FALSE",
        message: "An error occurred while hashing email data!",
      });
    });
};

router.get("/verify/:userId/:uniqueString", (req, res) => {
  let { userId, uniqueString } = req.params;

  UserVerification.find({ userId })
    .then((result) => {
      if (result.length > 0) {
        const { expireAt } = result[0];
        const hashedUniqueString = result[0].uniqueString;
        if (expireAt < Date.now()) {
          UserVerification.deleteOne({ userId })
            .then((result) => {
              user
                .deleteOne({ _id: userId })
                .then(() => {
                  let message = "Link has expired. Please sign up again.";
                  //res.redirect(`/verified/error=true&message=${message}`);
                  res.send({
                    status: "FAILED",
                    message: message
                  })
                })
                .catch((error) => {
                  let message =
                    "Clearing user with expired unique string failed";
                  //res.redirect(`/verified/error=true&message=${message}`);
                  res.send({
                    status: "FAILED",
                    message: message
                  })
                });
            })
            .catch((error) => {
              console.log(error);
              let message =
                "An error occurred while clearing expired user verification record";
              res.send({
                status: "FAILED",
                message: message
              })
                //res.redirect(`/verified/error=true&message=${message}`);
            });
        } else {
          bcrypt
            .compare(uniqueString, hashedUniqueString)
            .then((result) => {
              if (result) {
                User.updateOne({ _id: userId }, { isVerified: true })
                  .then(() => {
                    UserVerification.deleteOne({ userId })
                      .then(() => {
                        res.send({
                          status: "SUCCESS",
                          message: "Your account has been verified!",
                        })
                        // res.sendFile(
                        //   path.join(__dirname, "./../views/verified.html")
                        // );
                      })
                      .catch((error) => {
                        console.log(error);
                        let message =
                          "An error occurred while finalizing successful verification.";
                        res.send({
                          status: "FAILED",
                          message: message
                        })
                          //res.redirect(`/verified/error=true&message=${message}`);
                      });
                  })
                  .catch((error) => {
                    console.log(error);
                    let message =
                      "An error occurred while updating user record to show verified.";
                    res.send({
                      status: "FAILED",
                      message: message
                    })
                      //res.redirect(`/verified/error=true&message=${message}`);
                  });
              } else {
                let message =
                  "Invalid verification details passed. Check your inbox.";
                res.send({
                  status: "FAILED",
                  message: message
                })
                  //res.redirect(`/verified/error=true&message=${message}`);
              }
            })
            .catch((error) => {
              let message = "Ann error occured while comparing unique strings.";
              res.send({
                status: "FAILED",
                message: message
              })
              //res.redirect(`/verified/error=true&message=${message}`);
            });
        }
      } else {
        let message =
          "Account record does not exist or has been verified already. Please sign up or log in";
        res.send({
          status: "FAILED",
          message: message
        })
          //res.redirect(`/verified/error=true&message=${message}`);
      }
    })
    .catch((error) => {
      console.log(error);
      let message =
        "An error occurred while checking for existing user verification record";
      res.send({
        status: "FAILED",
        message: message
      })
        // res.redirect(`/verified/error=true&message=${message}`);
    });
});

router.get("/verified", (req, res) => {
  res.sendFile(path.join(__dirname, "./../views/verified.html"));
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
        if (data.length) {
          if (!data[0].isVerified) {
            res.send({
              status: "FAILED",
              message: "Email has not been verified yet. Check your inbox.",
            });
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
      })
      .catch((err) => {
        res.send({
          status: "FAILED",
          message: "An error occurred while checking for existing user",
          error: err,
        });
      });
  }
});

module.exports = router;
