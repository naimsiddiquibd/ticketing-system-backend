const express = require('express');
const {
  getTickets,
  createTicket,
  initiatePayment,
  handlePaymentCallback,
  getTicket,
  updateTicket,
  deleteTicket
} = require('../controllers/ticketController');
const validateToken = require('../middleware/validateTokenHandler');
const router = express.Router();

router.use(validateToken);

router.route("/").get(getTickets).post(createTicket);

router.route("/:id").get(getTicket).put(updateTicket).delete(deleteTicket);

router.route("/:id/pay").post(initiatePayment);

router.route("/bkash-callback").get(handlePaymentCallback);

module.exports = router;
