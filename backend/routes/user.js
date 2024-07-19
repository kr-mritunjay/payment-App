const express = require("express");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const JWT_SECRET = require("../config");
const { Account, User } = require("../db");
const authMiddleware = require("../middleware");
const userRouter = express.Router();

// console.log(User);

const signUpSchema = zod.object({
  username: zod.string().email(),
  password: zod.string().min(8),
  firstName: zod.string(),
  lastName: zod.string(),
});

userRouter.post("/signup", async (req, res) => {
  const { success, error } = signUpSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { username, password, firstName, lastName } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    const newUser = await User.create({
      username,
      password: hashedPassword,
      firstName,
      lastName,
    });

    // adding random amount during sigup

    const userId = newUser._id;

    try {
      await Account.create({
        userId,
        balance: 1 + Math.random() * 10000,
      });
      // res.json({
      //   msg: "Balance added successfull",
      // });
    } catch (err) {
      res.status(400).json({
        mag: "something went wrong!",
      });
    }
    const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);

    res.json({ msg: "User created successfully!", token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const signInSchema = zod.object({
  username: zod.string().email(),
  password: zod.string(),
});

userRouter.post("/signin", async (req, res) => {
  const { success, error } = signInSchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET);

    res.json({ msg: "User signed in successfully!", token });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

const updateBodySchema = zod.object({
  password: zod.string().min(8).optional(),
  firstName: zod.string(),
  lastName: zod.string(),
});

userRouter.put("/", authMiddleware, async (req, res) => {
  const { success, error } = updateBodySchema.safeParse(req.body);
  if (!success) {
    return res.status(400).json({ msg: "Error while updating information" });
  }

  try {
    const updateData = { ...req.body };

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    await User.updateOne({ _id: req.userId }, { $set: updateData });

    res.json({ msg: "Update successful" });
  } catch (err) {
    res.status(500).json({ msg: "Error updating user information" });
  }
});

userRouter.get("/all", authMiddleware, async (req, res) => {
  console.log("GET /all endpoint hit"); // Debug log
  const filter = req.query.filter || "";
  console.log("Filter:", filter); // Debug log

  try {
    const users = await User.find({
      $or: [
        { firstName: { $regex: filter, $options: "i" } },
        { lastName: { $regex: filter, $options: "i" } },
      ],
    });
    console.log("Users found:", users);

    res.json({
      users: users.map((user) => ({
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = userRouter;
