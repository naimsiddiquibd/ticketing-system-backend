const asyncHandler = require('express-async-handler');
const Ticket = require('../models/ticketModel');
//@Description: Get all the tickets
//@Route: GET /api/tickets
//@Access: Public
const getTickets = asyncHandler (async(req, res) => {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
});


//@Description: Create new ticket
//@Route: POST /api/tickets
//@Access: Public
const createTicket = asyncHandler(async(req, res) => {
    console.log("The requiest body is: " , req.body);
    const {eventId, userId, status} = req.body;
    if(!eventId || !userId || !status){
        res.status(404);
        throw new Error("All fields must be included in the request");
    }
    try {
        // Attempt to create the ticket
        const ticket = await Ticket.create({ eventId, userId, status });
        res.status(201).json(ticket);
      } catch (err) {
        // Handle duplicate key error (assuming Mongoose throws this error)
        if (err.code === 11000) { // MongoDB duplicate key error code
          res.status(400).json({ error: 'User has already registered for this event' });
        } else {
          // Handle other errors (e.g., validation errors)
          res.status(500).json({ error: 'Error creating ticket' });
        }
      }
});


//@Description: Get a single ticket
//@Route: GET /api/tickets
//@Access: Public
const getTicket = asyncHandler(async(req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
    {
        res.status(404);
        throw new Error ("Ticket not found!");
    }
    res.status(200).json(ticket);
});

//@Description: Update a ticket
//@Route: PUT /api/tickets
//@Access: Public
const updateTicket = asyncHandler(async(req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
    {
        res.status(404);
        throw new Error ("Ticket not found!");
    }
    const updatedTicket = await Ticket.findByIdAndUpdate(
        req.params.id,
        req.body,
        {new: true}
    )
    res.status(200).json(updatedTicket);
});

//@Description: Delete a ticket
//@Route: DELETE /api/tickets
//@Access: Public
const deleteTicket = asyncHandler(async(req, res) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket)
    {
        res.status(404);
        throw new Error ("Ticket not found!");
    }
    await Ticket.findByIdAndDelete(ticket);
    res.status(200).json(ticket);
});


module.exports = {getTickets, createTicket, getTicket, updateTicket, deleteTicket};