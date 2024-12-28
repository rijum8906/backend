const express = require("express");
const { addParticipant, getParticipants } = require("./../controllers/event.controller");
const router = express.Router();

const authMiddleware = require("./../middlewares/auth-middleware");

router.post("/add-participant", authMiddleware, addParticipant);
router.get("/get-participants", authMiddleware, getParticipants);

module.exports = router;
