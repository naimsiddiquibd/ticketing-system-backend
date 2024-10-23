const asyncHandler = require('express-async-handler');
const Event = require('../models/eventModel');
const upload = require('../middleware/upload');
const cloudinary = require('../config/cloudinary');

// @Description: Get all events
// @Route: GET /api/events
// @Access: Public
const getEvents = asyncHandler(async (req, res) => {
  const events = await Event.find();
  res.status(200).json(events);
});



// @Description: Create new event
// @Route: POST /api/events
// @Access: Private (Organizer)
const createEvent = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload failed', error: err.message });
    }

    const {
      eventName,
      eventCategory,
      venue,
      startDateTime,
      endDateTime,
      timezone,
      recurringEvent,
      ageRestriction,
      dressCode,
      description,
      specialInstructions,
      price // Extract price from the request body
    } = req.body;

    // Check for required fields, including the new price field
    if (!eventName || !eventCategory || !venue || !startDateTime || !endDateTime || !timezone || !description || price === undefined) {
      res.status(400);
      throw new Error("All required fields must be included in the request");
    }

    // Handle Cloudinary upload for eventLogo
    let eventLogoUrl = null;
    if (req.files['eventLogo']) {
      const eventLogo = req.files['eventLogo'][0];
      const uploadResult = await cloudinary.uploader.upload(eventLogo.path, {
        folder: 'event_logos', // Cloudinary folder
        resource_type: 'image'
      });
      eventLogoUrl = uploadResult.secure_url; // Get the secure URL from Cloudinary response
    }

    // Handle Cloudinary upload for thumbnail
    let thumbnailUrl = null;
    if (req.files['thumbnail']) {
      const thumbnail = req.files['thumbnail'][0];
      const uploadResult = await cloudinary.uploader.upload(thumbnail.path, {
        folder: 'event_thumbnails', // Cloudinary folder
        resource_type: 'image'
      });
      thumbnailUrl = uploadResult.secure_url; // Get the secure URL from Cloudinary response
    }

    // Create event
    const event = await Event.create({
      eventName,
      organizer: req.user.id, // Automatically assign the logged-in user's ID as the organizer
      eventCategory,
      venue,
      startDateTime,
      endDateTime,
      timezone,
      recurringEvent,
      ageRestriction,
      dressCode,
      description,
      specialInstructions,
      price, // Include the price field when creating the event
      eventLogo: eventLogoUrl,
      thumbnail: thumbnailUrl
    });

    res.status(201).json(event);
  });
});


// @Description: Get a single event
// @Route: GET /api/events/:id
// @Access: Public
const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found!");
  }
  res.status(200).json(event);
});

// @Description: Update an event
// @Route: PUT /api/events/:id
// @Access: Private (Organizer)
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found!");
  }

  if (event.organizer.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User does not have permission to update this event");
  }

  const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.status(200).json(updatedEvent);
});

// @Description: Delete an event
// @Route: DELETE /api/events/:id
// @Access: Private (Organizer)
const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found!");
  }

  if (event.organizer.toString() !== req.user.id) {
    res.status(403);
    throw new Error("User does not have permission to delete this event");
  }

  await Event.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: 'Event deleted successfully' });
});


// @Description: Get all events created by the logged-in user
// @Route: GET /api/events/my-events
// @Access: Private
const getUserEvents = asyncHandler(async (req, res) => {
  const userId = req.user.id; // Get the logged-in user's ID
  console.log("user id: " + userId);
  const events = await Event.find({ organizer: userId }); // Filter events by organizer
  res.status(200).json(events);
});

// @Description: Get all events created by the logged-in user
// @Route: GET /api/events/my-events
// @Access: Private
const getUserEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error("Event not found!");
  }
  res.status(200).json(event);
});


module.exports = {
  getEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  getUserEvents,
  getUserEvent
};
