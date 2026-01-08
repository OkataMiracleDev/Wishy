const mongoose = require("mongoose");

const WishlistItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true },
    importance: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    description: { type: String, trim: true },
  },
  { _id: true, timestamps: true }
);

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
    items: { type: [WishlistItemSchema], default: [] },
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
    thankYouMessage: { type: String, trim: true, default: "Thank you for your generous contribution!" },
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
    payments: {
      type: [
        {
          wishlistId: { type: mongoose.Schema.Types.ObjectId },
          itemId: { type: mongoose.Schema.Types.ObjectId },
          amount: { type: Number, required: true, min: 0 },
          name: { type: String, trim: true },
          email: { type: String, trim: true },
          imageUrl: { type: String, trim: true },
          source: { type: String, enum: ["self", "external"], default: "self" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
    walletBalance: { type: Number, default: 0, min: 0 },
    walletTransactions: {
      type: [
        {
          type: { type: String, enum: ["deposit", "withdraw"], required: true },
          amount: { type: Number, required: true, min: 0 },
          reference: { type: String, trim: true },
          status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
          meta: { type: Object },
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
