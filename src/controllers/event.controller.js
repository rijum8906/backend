// Dependencies
const asyncHandler = require("./../utils/async-handler");
const appError = require("./../utils/app-error");
const appResponse = require("./../utils/app-response");
const Participant = require("./../models/participant.model");

// Add a new Event
module.exports.addParticipant = asyncHandler(async (req, res) => {
  const { name, category, house, event, rank } = req.body;
  if (!category || !house || !event || !rank) {
    throw new appError("Invalid data type given for new Event.", 401);
  }

  const participant = new Participant({ name, category, event, house, rank });
  await participant.save();

  res.status(201).json(new appResponse("New participant added successfully.", { participant }));
});

// Get participants list
module.exports.getParticipants = asyncHandler(async (req, res) => {
  const participants = await Participant.find({});
  res.status(200).json({ participants });
});

// Edit participant details
module.exports.editParticipant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, category, house, event, rank } = req.body;

  if (!id) {
    throw new appError("Participant ID is required.", 400);
  }

  const updatedParticipant = await Participant.findByIdAndUpdate(
    id,
    { name, category, house, event, rank },
    { new: true, runValidators: true }
  );

  if (!updatedParticipant) {
    throw new appError("Participant not found or could not be updated.", 404);
  }

  res.status(200).json(new appResponse("Participant updated successfully.", { updatedParticipant }));
});

// Delete participant 
module.exports.deleteParticipant = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const user = await User.deleteOneById(id);
});