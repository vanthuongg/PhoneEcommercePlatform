const express = require('express');
const router = express.Router();
const { getMyTickets, getAllTicketsStaff, createTicket, replyTicket, closeTicket, markTicketAsRead } = require('./ticket.controller');
const { protect, authorize } = require('../../middleware/auth');

router.use(protect);
router.get('/my', getMyTickets);
router.post('/', createTicket);
router.get('/staff', authorize('admin', 'manager', 'staff'), getAllTicketsStaff);
router.post('/:id/reply', replyTicket);
router.put('/:id/read', markTicketAsRead);
router.put('/:id/close', authorize('admin', 'manager', 'staff'), closeTicket);

module.exports = router;
