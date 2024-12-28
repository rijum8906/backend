const express = require("express");
const { addParticipant, getParticipants, editParticipant } = require("./../controllers/event.controller");
const router = express.Router();

const { authMiddleware, adminAuthMiddleware } = require("./../middlewares/auth-middleware");

router.post("/add-participant", authMiddleware, addParticipant);
router.get("/get-participants", authMiddleware, getParticipants);
router.put("/edit-participant/:id", adminAuthMiddleware, editParticipant);

module.exports = router;
