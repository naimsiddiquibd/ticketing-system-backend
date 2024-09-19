const asyncHandler = require('express-async-handler');
const Ticket = require('../models/ticketModel');
const { createPayment, executePayment } = require('bkash-payment');
const Event = require('../models/eventModel');

// bKash Credentials setup
const bkashConfig = {
    base_url : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
    username: '01770618567',
    password: 'D7DaC<*E*eG',
    app_key: '0vWQuCRGiUX7EPVjQDr0EUAYtc',
    app_secret: 'jcUNPBgbcqEDedNKdvE4G1cAK7D3hCjmJccNPZZBq96QIxxwAMEx'
   }

//@Description: Get all the tickets
//@Route: GET /api/tickets
//@Access: Private
const getTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({userId: req.user.id});
  res.status(200).json(tickets);
});

//@Description: Create new ticket
//@Route: POST /api/tickets
//@Access: Private
const createTicket = asyncHandler(async (req, res) => {
  const { eventId, status, price } = req.body;

  if (!eventId || !status || !price) {
    res.status(400);
    throw new Error("All fields must be included in the request");
  }

  // Fetch the event details
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  try {
    // Create a new ticket
    const ticket = await Ticket.create({
      eventId,
      userId: req.user.id,  // This assumes you're handling auth and req.user is available
      eventName: event.eventName,
      organizer: event.organizer,  // Storing the organizer ID
      thumbnail: event.thumbnail,
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      status,
      price
    });

    res.status(201).json(ticket);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'User has already registered for this event' });
    } else {
      console.error(err);  // Log error for debugging
      res.status(500).json({ error: 'Error creating ticket' });
    }
  }
});

//@Description: Initiate bKash payment
//@Route: POST /api/tickets/:id/pay
//@Access: Private
const initiatePayment = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found!");
  }

  const paymentDetails = {
    amount: ticket.price,
    // callbackURL: 'http://127.0.0.1:3000/api/tickets/bkash-callback',
    callbackURL: 'http://localhost:3000/mytickets',
    orderID: ticket._id.toString(),
    reference: ticket.userId
  };

  try {
    const result = await createPayment(bkashConfig, paymentDetails);
    res.status(200).json(result);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Error initiating payment' });
  }
});

//@Description: Handle bKash payment callback
//@Route: GET /api/tickets/bkash-callback
//@Access: Private
const handlePaymentCallback = asyncHandler(async (req, res) => {
  const { status, paymentID } = req.query;
  let result;
  let response = {
    statusCode: '4000',
    statusMessage: 'Payment Failed'
  };

  if (status === 'success') {
    result = await executePayment(bkashConfig, paymentID);
  }

  if (result?.transactionStatus === 'Completed') {
    await Ticket.findByIdAndUpdate(result.orderID, { paymentStatus: 'completed', status: 'purchased' });
    response = {
      statusCode: result.statusCode,
      statusMessage: result.statusMessage
    };
  }

  res.status(200).json(response);
});

//@Description: Get a single ticket
//@Route: GET /api/tickets/:id
//@Access: Private
const getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found!");
  }
  res.status(200).json(ticket);
});

//@Description: Update a ticket
//@Route: PUT /api/tickets/:id
//@Access: Private
const updateTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found!");
  }
  if (ticket.userId.toString() !== req.user.id){
    res.status(403);
    throw new Error("User don't have permission to update other's tickets");
  };

  const updatedTicket = await Ticket.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.status(200).json(updatedTicket);
});

//@Description: Delete a ticket
//@Route: DELETE /api/tickets/:id
//@Access: Private
const deleteTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found!");
  }
  if (ticket.userId.toString() !== req.user.id){
    res.status(403);
    throw new Error("User don't have permission to delete other's tickets");
  };
  await Ticket.findByIdAndDelete({_id: req.params.id});
  res.status(200).json(ticket);
});

// @Description: Get all tickets for a specific event (Only for the event organizer)
// @Route: GET /api/tickets/event/:eventId
// @Access: Private (Organizer only)
const getTicketsByEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  // Check if the event exists
  const event = await Event.findById(eventId);
  if (!event) {
    res.status(404);
    throw new Error("Event not found");
  }

  // Ensure the user is the organizer of the event
  // if (event.organizer.toString() !== req.user.id) {
  //   res.status(403);
  //   throw new Error("User is not the organizer of this event");
  // }

  // Fetch all tickets for the event
  const tickets = await Ticket.find({ eventId });
  res.status(200).json(tickets);
});

module.exports = {
  getTicketsByEvent,
  // other functions...
};

module.exports = {
  getTickets,
  createTicket,
  initiatePayment,
  handlePaymentCallback,
  getTicket,
  updateTicket,
  deleteTicket,
  getTicketsByEvent
};
