const express = require('express');
const { getTickets, createTicket, getTicket, updateTicket, deleteTicket } = require('../controllers/ticketController');
const router = express.Router();

router.route("/").get(getTickets);

router.route("/").post(createTicket);

router.route("/:id").get(getTicket);

router.route("/:id").put(updateTicket);

router.route("/:id").delete(deleteTicket);


module.exports = router;