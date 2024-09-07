const express = require('express');
const {
  getTickets,
  createTicket,
  initiatePayment,
  handlePaymentCallback,
  getTicket,
  updateTicket,
  deleteTicket,
  getTicketsByEvent
} = require('../controllers/ticketController');
const validateToken = require('../middleware/validateTokenHandler');
const organizerCheck = require('../middleware/organizerCheck');
const router = express.Router();

router.use(validateToken);

// Add a route for fetching tickets by event ID for organizers
router.route("/event/:eventId").get(organizerCheck, getTicketsByEvent);

router.route("/").get(getTickets).post(createTicket);

router.route("/:id").get(getTicket).put(updateTicket).delete(deleteTicket);

router.route("/:id/pay").post(initiatePayment);

router.route("/bkash-callback").get(handlePaymentCallback);

module.exports = router;
