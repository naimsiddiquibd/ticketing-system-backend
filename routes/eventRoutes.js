const express = require('express');
const {
  getEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');
const validateToken = require('../middleware/validateTokenHandler');
const organizerCheck = require('../middleware/organizerCheck');

const router = express.Router();

router.use(validateToken);

router.route('/')
  .get(getEvents)
  .post(organizerCheck, createEvent);

router.route('/:id')
  .get(getEvent)
  .put(organizerCheck, updateEvent)
  .delete(organizerCheck, deleteEvent);

module.exports = router;
