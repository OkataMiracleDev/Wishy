const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    nickname: {
      type: String,
      unique: true,
      trim: true,
      sparse: true, // Allows null/undefined if not set immediately
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    countryCode: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
