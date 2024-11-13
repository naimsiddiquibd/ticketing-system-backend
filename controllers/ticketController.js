const asyncHandler = require('express-async-handler');
const Ticket = require('../models/ticketModel');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const axios = require('axios');
const crypto = require('crypto');

const APP_KEY = '38d31ec7a6371e9effedf8cefceacec4'; // Replace with your actual App Key
const SECRET_KEY = '29263b8238eefc766548751280b6d62d'; // Replace with your actual Secret Key

// Helper function to get current timestamp
function getCurrentTimestamp() {
  return Math.floor(Date.now() / 1000);
}

// Generate Bearer token for the payment gateway
function generateBearerToken() {
  const timestamp = getCurrentTimestamp();
  const token = crypto.createHash('md5').update(SECRET_KEY + timestamp).digest('hex');
  return `Bearer ${Buffer.from(`${APP_KEY}:${token}`).toString('base64')}`;
}

//@Description: Initiate payment with the new gateway
//@Route: POST /api/tickets/:id/pay
//@Access: Private
const initiatePayment = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found!");
  }

  const {
    amount, currency, redirect_url, ipn_url,
    product_name, product_description,
    name, email, phone, address, city, state, zipcode, country
  } = req.body;

  const order = {
    amount,
    currency: currency || 'BDT',
    redirect_url,
    ipn_url,
  };

  const product = {
    name: product_name,
    description: product_description,
  };

  const billing = {
    customer: {
      name,
      email,
      phone,
      address: {
        street: address,
        city,
        state,
        zipcode,
        country: country || 'BD',
      }
    }
  };

  const data = { order, product, billing };
  console.log("ddd: " + JSON.stringify(data));

  try {
    const response = await axios.post('https://api-sandbox.portpos.com/payment/v2/invoice', data, {
      headers: {
        'Authorization': generateBearerToken(),
        'Content-Type': 'application/json'
      }
    });
    res.json(response.data);
    console.log("response.data: ", response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//@Description: Verify payment transaction
//@Route: POST /api/tickets/verify-transaction
//@Access: Private
const verifyTransaction = asyncHandler(async (req, res) => {
  const { invoice, amount } = req.body;

  try {
    const response = await axios.get(`https://api-sandbox.portpos.com/payment/v2/invoice/ipn/${invoice}/${amount}`, {}, {
      headers: {
        'Authorization': generateBearerToken(),
        'Content-Type': 'application/json',
      }
    });

    if (response.data.status === 'Completed') {
      await Ticket.findByIdAndUpdate(invoice, { paymentStatus: 'completed', status: 'purchased' });
    }

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error verifying transaction' });
  }
});

//@Description: Handle refund request
//@Route: POST /api/tickets/refund/:invoice_id
//@Access: Private
const handleRefundRequest = asyncHandler(async (req, res) => {
  const { invoice_id } = req.params;
  const { amount, currency } = req.body;

  const refund = {
    amount,
    currency: currency || 'BDT',
  };

  try {
    const response = await axios.post(`https://api-sandbox.portpos.com/payment/v2/invoice/refund/${invoice_id}`, { refund }, {
      headers: {
        'Authorization': generateBearerToken(),
        'Content-Type': 'application/json',
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Error processing refund' });
  }
});


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

  // Fetch the user details
  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  try {
    // Create a new ticket
    const ticket = await Ticket.create({
      eventId,
      userId: req.user.id,
      userName: user.name,           // Assuming 'name' is the field for the user's name
      userEmail: user.email,          // Assuming 'email' is the field for the user's email
      userPhone: user.phoneNumber,          // Assuming 'phone' is the field for the user's phone number
      eventName: event.eventName,
      organizer: event.organizer,
      thumbnail: event.thumbnail,
      startDate: event.startDate,
      startTime: event.startTime,
      endDate: event.endDate,
      endTime: event.endTime,
      status,
      price
    });

    res.status(201).json(ticket);
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'User has already registered for this event' });
    } else {
      console.error(err);
      res.status(500).json({ error: 'Error creating ticket' });
    }
  }
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
  if (ticket.organizer.toString() !== req.user.id){
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
  initiatePayment,
  verifyTransaction,
  handleRefundRequest,
  
  getTickets,
  createTicket,
  getTicket,
  updateTicket,
  deleteTicket,
  getTicketsByEvent
};
