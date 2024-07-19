const express = require("express");
const mongoose = require("mongoose");
const accountRouter = express.Router();
const authMiddleware = require("../middleware");
const { Account } = require("../db");

accountRouter.get("/balance", authMiddleware, async (req, res) => {
  try {
    const account = await Account.findOne({
      userId: req.userId,
    });
    if (!account) {
      return res.status(404).json({ msg: "Account not found" });
    }
    res.json({
      balance: account.balance,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
});

accountRouter.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();

  try {
    // starting the one thread session to transfer the
    // money from one account to another
    session.startTransaction();
    const { amount, to } = req.body; // take the amoun and account to pay from frontend

    const account = await Account.findOne({ userId: req.userId }).session(
      session
    );

    if (!account || account.balance < amount) {
      await session.abortTransaction();
      return res.status(400).json({
        msg: "Insufficient balance",
      });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);

    if (!toAccount) {
      await session.abortTransaction();
      return res.status(400).json({
        msg: "Account not found",
      });
    }

    // Perform the transaction
    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    ).session(session);
    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    res.json({
      msg: "Transfer successful",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ msg: "Transfer failed", error });
  }
});

module.exports = accountRouter;
