const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Invalid Email");
      }
    },
  },
  password: {
    type: String,
    require: true,
    trim: true,
    minLength: 8,
  },
  dateOfBirth: Date,
  gender: Boolean,
  address: String,
  city: String,
  country: String,
  zipCode: String,
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAdministrator: {
    type: Boolean,
    default: false,
  },
  walletId: {
    type: String,
    unique: true,
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
