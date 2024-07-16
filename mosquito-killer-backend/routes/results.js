const express = require("express");
const Result = require("../models/Result");
const router = express.Router();

// Post a new result
router.post("/", async (req, res) => {
  try {
    const { username, score, time } = req.body;
    // New instance of the result model
    const newResult = new Result({ username, score, time });
    await newResult.save();
    // Convert the result in json format
    res.status(201).json(newResult);
    console.log("posted!");
  } catch (error) {
    res.status(500).json({ message: "Error saving the result", error });
  }
});

// Get the leaderboard
router.get("/", async (req, res) => {
  try {
    const results = await Result.find().sort({ score: -1, time: 1 }).limit(15);
    res.status(200).json(results);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving the leaderboard", error });
  }
});

module.exports = router;
