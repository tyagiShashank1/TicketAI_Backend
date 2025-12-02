import User from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { inngest } from "../inngest/client.js";

//Register
export const createUser = async (req, res) => {
  try {
    const { email, password, skills = [] } = req.body;
    console.log(req.body);
    const user = await User.findOne({ email: email });
    console.log(user);
    if (user) {
      return res.json("User already exists, Please login");
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email: email,
        password: hashedPassword,
        role:'user',
        skills: skills,
      });
      console.log(user);
      //FIRE INNGEST EVENT
      try {
        const response = await inngest.send({
          name: "user/signup",
          data: {
            email: user.email,
            id: user._id,
          },
        });
        console.log("Inngest response: ", response);
      } catch (error) {
        console.error("Inngest error:", error.message);
      }
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      res.cookie("Access_Token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      return res.json({ success: true, message: "User created successfully" , user:user});
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Sign Up Failed", error: error });
  }
};

//login
export const loginUser = async (req, res) => {
  try {
    const { Access_Token } = req.cookies;
    if (Access_Token) return res.json({ message: "Already Logged In" });
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.json("User does not exists, Please Sign Up.");
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json("Invalid Credentials");
      }
      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
      res.cookie("Access_Token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      });

      return res.json({ success: true, message: "Logged In Successfully !",user:user });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Login Failed", error: error });
  }
};

//logout
export const logoutUser = async (req, res) => {
  try {
    const { Access_Token } = req.cookies;
    if (!Access_Token)
      return res.json({ message: "You are already logged out" });
    res.clearCookie("Access_Token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ message: "Logged Out Successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Logout Failed" });
  }
};

//Update User
export const updateUser = async (req, res) => {
  try {
    const { skills = [], role, email } = req.body;

    if (req.user?.role !== "admin")
      return res
        .status(403)
        .json({ message: "You dont have access to update the user" });
    const user = await User.findOne({ email: email });
    if (!user) return res.json({ message: "User not found" });
    await User.updateOne(
      {
        email,
      },
      {
        skills: skills.length ? skills : user.skills,
        role,
      }
    );
    return res.json({ success: true, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "User Updation Failed" });
  }
};

//Get All Users Details
export const getUsers = async (req, res) => {
  try {
    console.log(req.user);
    if (req.user?.role !== "admin"){
       return res.status(403).json({
        message: "You dont have access to get the details of other user",
      });
    }
     

    const users = await User.find();
    console.log("USERS ARE",users);
    if (!users) {
      return res.json({ message: "Users not Found, Get user failed" });
    }
    return res.json({ message: "All Users Found successfully", users: users });
  } catch (error) {
    res.status(500).json({ message: "Users Found Failed " });
  }
};
