const express = require("express");
const router = express.Router();
const jwtHelper = require("../config/jwtHelper");
const User = require("../models/user");

function setDate(date, time) {
  const d = new Date(date),
    s = time,
    parts = s.match(/(\d+)\.(\d+) (\w+)/),
    hours = /am/i.test(parts[3])
      ? parseInt(parts[1], 10)
      : parseInt(parts[1], 10) + 12,
    minutes = parseInt(parts[2], 10);

  d.setHours(hours);
  d.setMinutes(minutes);
  return d;
}
router.get(
  "/findByDate",
  jwtHelper.verifyjwtoken,
  jwtHelper.isAdmin,
  async (req, res) => {
    try {
      const { start_Date, end_Date } = req.body;
      console.log("start_Date", setDate(start_Date, "12.01 AM"));
      console.log("end_Date", setDate(end_Date, "11.59 PM"));
      const getAllUsers = await User.find({
        createdAt: {
          $gte: setDate(start_Date, "12.00 AM"),
          $lte: setDate(end_Date, "11.59 PM"),
        },
      }).select("-password");
      return res.status(200).send({ error: false, user: getAllUsers });
    } catch (err) {
      console.log(err);
      return res.status(500).send({ error: true, message: err });
    }
  }
);
router.get(
  "/allUsers",
  jwtHelper.verifyjwtoken,
  jwtHelper.isAdmin,
  async (req, res) => {
    try {
      const allUsers = await User.find().select("-password");
      return res.status(200).send({ error: false, users: allUsers });
    } catch (err) {
      return res.status(500).send({ error: true, message: err });
    }
  }
);

router.get(
  "/:id",
  jwtHelper.verifyjwtoken,
  jwtHelper.isAdmin,
  async (req, res) => {
    try {
      const singleUser = await User.findById(req.params.id).select("-password");
      return res.status(200).send({ error: false, user: singleUser });
    } catch (err) {
      return res.status(500).send({ error: true, message: err });
    }
  }
);

module.exports = router;
