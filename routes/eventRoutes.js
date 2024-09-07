// const express = require('express');
// const {
//   getEvents,
//   createEvent,
//   getEvent,
//   updateEvent,
//   deleteEvent
// } = require('../controllers/eventController');
// const validateToken = require('../middleware/validateTokenHandler');
// const organizerCheck = require('../middleware/organizerCheck');

// const router = express.Router();

// router.use(validateToken);

// router.route('/')
//   .get(getEvents)
//   .post(organizerCheck, createEvent);

// router.route('/:id')
//   .get(getEvent)
//   .put(organizerCheck, updateEvent)
//   .delete(organizerCheck, deleteEvent);

// module.exports = router;


const express = require('express');
const {
  getEvents,
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  getUserEvents,
  getUserEvent // Import the new function
} = require('../controllers/eventController');
const validateToken = require('../middleware/validateTokenHandler');
const organizerCheck = require('../middleware/organizerCheck');

const router = express.Router();

// Public routes (no authentication required)
router.route('/')
  .get(getEvents); // Publicly accessible

  // New route for fetching the logged-in user's events
router.route('/my-events')
.get(validateToken, getUserEvents); // Requires authentication

  // New route for fetching the logged-in user's a single events
  router.route('/my-events/:id')
  .get(validateToken, getUserEvent); // Requires authentication

router.route('/:id')
  .get(getEvent); // Publicly accessible

// Protected routes (authentication and organizer role required)
router.use(validateToken);

router.route('/')
  .post(organizerCheck, createEvent); // Requires organizer role

router.route('/:id')
  .put(organizerCheck, updateEvent) // Requires organizer role
  .delete(organizerCheck, deleteEvent); // Requires organizer role



module.exports = router;
