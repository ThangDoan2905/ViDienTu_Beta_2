const CreateUserVerification = require("../models/CreateUserVerification");
const DeleteUserVerification = require("./../models/DeleteUserVerification");
const UpdateUserVerification = require("../models/UpdateUserVerification");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const bcrypt = require("bcrypt");

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

const sendVerificationCreate = ({ _id, email }, res) => {
  const currentUrl = "http://localhost:3000/";

  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Your Account",
    html: `<p>Verify your email address to complete the signup and login into your account.</p>
        <p>This link will be <b>expired in 6 hours</b>.</p>
        <p>Press <a href=${
          currentUrl + "verify/" + _id + "/" + uniqueString
        }>here</a> to process.</p>`,
  };

  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      const newVerification = new CreateUserVerification({
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
              console.log(error);
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
        status: "FAILED",
        message: "An error occurred while hashing email data!",
      });
    });
};

const sendVerificationDelete = ({ _id, email }, res) => {
  const currentUrl = "http://localhost:3000/";

  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Delete Your Account",
    html: `<p>Clicking the link below to complete deleting your account.</p>
        <p>This link will be <b>expired in 6 hours</b>.</p>
        <p>Press <a href=${
          currentUrl + "verify-delete/" + _id + "/" + uniqueString
        }>here</a> to process.</p>`,
  };

  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      const newVerification = new DeleteUserVerification({
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
                message: "Verification email for deleting your account sent!",
              });
            })
            .catch((error) => {
              console.log(error);
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
    .catch((err) => {
      res.send({
        status: "FAILED",
        message: "An error occurred while hashing email data!",
        error: err,
      });
    });
};

const sendVerificationUpdate = ({ _id, email }, res) => {
  const currentUrl = "http://localhost:3000/";

  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: email,
    subject: "Verify Update Your Account",
    html: `<p>Click the link below to complete updating your account.</p>
        <p>This link will be <b>expired in 6 hours</b>.</p>
        <p>Press <a href=${
          currentUrl + "verify-update/" + _id + "/" + uniqueString
        }>here</a> to process.</p>`,
  };

  const saltRounds = 10;
  bcrypt
    .hash(uniqueString, saltRounds)
    .then((hashedUniqueString) => {
      const newVerification = new UpdateUserVerification({
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
        status: "FAILED",
        message: "An error occurred while hashing email data!",
      });
    });
};

module.exports = {
  sendVerificationCreate,
  sendVerificationDelete,
  sendVerificationUpdate,
};
