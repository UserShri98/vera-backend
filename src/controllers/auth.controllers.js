const userModel = require("../models/user.model");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Register controller
const registerController = async (req, res) => {
  const {
    email,
    fullName: { firstName, lastName },
    password,
  } = req.body;

  const isUser = await userModel.findOne({
    email,
  });

  if (isUser) {
    return res.status(400).json({
      message: "User already exists",
    });
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const user = await userModel.create({
    email,
    fullName: {
      firstName,
      lastName,
    },
    password: hashPassword,
  });

  const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET);

  res.cookie("token", token);

  res.status(201).json({
    message: "User Register Successfully",
    user: {
      email: user.email,
      fullName: user.fullName,
    },
  });
};

// Login controller
const loginController = async (req, res) => {
  const { email, password } = req.body;

  const user = await userModel.findOne({
    email,
  });

  if (!user) {
    return res.status(400).json({
      message: "User Dosen't exists",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(400).json({
      message: "Invalid Password",
    });
  }

  const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET);

  res.cookie("token", token);

  res.status(200).json({
    message: "User Login Successfully",
    user: {
      email: user.email,
      fullName: user.fullName,
    },
  });
};

const logOutController = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({
    message: "User Logged Out Successfully",
  });
}

module.exports = {
  registerController,
  loginController,
  logOutController,
};
