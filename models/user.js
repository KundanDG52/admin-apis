const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      min: 3,
      max: 30,
    },
    address: {
      type: String,
      required: true,
      max: 50,
    },
    customer_photo: {
      type: String,
      required: true,
    },
    mobile_number: {
      type: Number,
      required: true,
    },
    email_id: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", userSchema);
