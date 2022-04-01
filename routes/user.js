const express = require("express");
const { updateOne } = require("../models/user");
const user = require("../models/user");
const router = express.Router();
const User = require("../models/user");
const PasswordHash = require("password-hash");
const ctruser = require("../config/controller");
const Jwt_helper = require("../config/jwtHelper");
const fs = require("fs");
const path = require("path");
const validateMobile = function (phoneNumber) {
  var re = /((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/;
  return re.test(phoneNumber);
};

const validateEmail = function (email) {
  var re = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
  return re.test(email);
};

router.get("/image/:filename", async (req, res) => {
  try {
    let filename = req.params.filename;
    let file = fs.createReadStream(
      path.join(__dirname, "..", "uploads", filename)
    );
    file.pipe(res);
  } catch (error) {
    res.status(200).send({ error: true, message: error });
  }
});
router.post("/login", ctruser.authenticate);

router.post("/", async (req, res) => {
  const { name, address, mobile_number, email_id, password, role } = req.body;
  const Image = req.files.customer_photo;
  // console.log(Image, req.body);
  if (
    Image.mimetype !== "image/jpeg" &&
    Image.mimetype !== "image/jpg" &&
    Image.mimetype !== "image/png"
  ) {
    return res
      .status(403)
      .send({ error: true, message: "file type not supported" });
  }
  if (Image.size > 5000000) {
    return res
      .status(403)
      .send({ error: true, message: "Image size must be less then 5 MB" });
  }
  if (name.length < 3 || name.length > 30) {
    return res.status(403).send({
      error: true,
      message: "Name should be between 3 to 30 characters",
    });
  }
  if (address.length > 50) {
    return res.status(403).send({
      error: true,
      message: "Address should not be more than 50 characters",
    });
  }
  if (!validateMobile(mobile_number)) {
    return res
      .status(403)
      .send({ error: true, message: "Please enter a valid mobile number" });
  }
  if (!validateEmail(email_id)) {
    return res
      .status(403)
      .send({ error: true, message: "Please enter a valid Email ID" });
  }
  const hash = PasswordHash.generate(password);
  const profile_picture =
    new Date().toISOString().replace(/:/g, "-") + Image.name;
  fs.writeFile(
    path.join(__dirname, "..", "uploads", profile_picture),
    Image.data,
    (err) => {
      if (!err) console.log("Image uploaded");
    }
  );

  const newUser = new User({
    name: name.trim(),
    address: address.trim(),
    customer_photo: "https://axs-assignment.herokuapp.com/" + profile_picture,
    mobile_number: mobile_number.trim(),
    email_id: email_id.trim(),
    password: hash,
    role: "user",
  });
  try {
    await newUser.save();
    return res
      .status(201)
      .send({ error: false, message: "New user created successfully" });
  } catch (err) {
    return res.status(500).send({ error: true, message: err });
  }
});

router.get("/", Jwt_helper.verifyjwtoken, async (req, res) => {
  try {
    let user = await User.findOne({ _id: req._id }).select([
      "-password",
      "-role",
    ]);
    res.status(200).send({ error: false, user: user });
  } catch (error) {
    res.status(500).send({ error: true, message: error });
  }
});
module.exports = router;
