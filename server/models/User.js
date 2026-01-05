const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    currency: { type: String, required: true, trim: true }, // e.g. NGN, USD
    plan: { type: String, enum: ["daily", "weekly", "monthly"], required: true },
    goal: { type: Number, default: 0, min: 0 },
    currentSaved: { type: Number, default: 0, min: 0 },
    importance: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    imageUrl: { type: String, trim: true },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { _id: true, timestamps: true }
);

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
    accountNumber: { type: String, trim: true },
    accountName: { type: String, trim: true },
    bankName: { type: String, trim: true },
    thankYouMessage: { type: String, trim: true },
    shareToken: { type: String, index: true, unique: true, sparse: true },
    defaultPlan: { type: String, enum: ["daily", "weekly", "monthly"] },
    wishlists: { type: [WishlistSchema], default: [] },
    donations: {
      type: [
        {
          imageData: String,
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

module.exports = User;
