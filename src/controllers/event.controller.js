// Dependencies
const asyncHandler = require("./../utils/async-handler");
const appError = require("./../utils/app-error");
const appResponse = require("./../utils/app-response");
const Participant= require("./../models/participant.model");

// Add a new Event
module.exports.addParticipant = asyncHandler(async (req, res) => {
  const { name, category,house, event, rank} = req.body;
  if (!category || !house || !event || !rank) {
    throw new appError("Invalid data type given for new Event.", 401);
  }

  const participant= new Participant({ name, category, event, house, rank });
  await participant.save();

  res.status(201).json(new appResponse("New participant added Successfully.", { participant }));
});

// Get event list 
module.exports.getParticipants = asyncHandler(async (req, res)=>{
  const participants = await Participant.find({});
  res.status(200).json({participants})
});