const router = require("express").Router();
const Conversation = require("../models/Conversation");
const verify = require("./verifyToken");

//new conversation
////router.post("/", verify, async (req, res) => {
router.post("/", async (req, res) => {
  const newConversation = new Conversation({
    users: [req.body.senderId, req.body.receiverId],
  });

  try {
    const savedConvo = await newConversation.save();
    res.status(200).json(savedConvo);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get user convos
router.get("/:userId", async (req, res) => {
  try {
    const conversation = await Conversation.find({
      users: { $in: [req.params.userId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get convo btw users for a new conversationa action
router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
  try {
    const conversation = await Conversation.findOne({
      users: { $all: [req.params.firstUserId, req.params.secondUserId] },
    });
    res.status(200).json(conversation);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
