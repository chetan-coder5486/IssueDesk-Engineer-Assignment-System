import User from "../models/user.model.js";
import Ticket from "../models/ticket.model.js";
import { calculateDueDate, isBreached } from "../models/sla.model.js";
import { sendMail } from "../utils/email.js";

export const createTicket = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in req.user
        const { title, description, priority, category } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const ticketPriority = priority || 'MEDIUM';
        const dueDate = calculateDueDate(ticketPriority);

        const newTicket = new Ticket({
            title,
            description,
            priority: ticketPriority,
            category: category || 'General',
            reporter: userId,
            dueDate
        });
        await newTicket.save();

        // Populate reporter for response
        await newTicket.populate('reporter');

        return res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

// Helper to check and update breach status for tickets
const checkBreachStatus = async (tickets) => {
    const updates = [];
    for (const ticket of tickets) {
        const shouldBeBreached = isBreached(ticket.dueDate, ticket.status);
        if (shouldBeBreached && !ticket.breached) {
            ticket.breached = true;
            updates.push(Ticket.updateOne({ _id: ticket._id }, { breached: true }));
        }
    }
    if (updates.length > 0) {
        await Promise.all(updates);
    }
    return tickets;
};

export const getAllTickets = async (req, res) => {
    try {
        const tickets = await Ticket.find().populate('reporter assignee');
        // Check and update breach status
        await checkBreachStatus(tickets);
        return res.status(200).json({ tickets });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getTicketById = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId).populate('reporter assignee');
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        // Check and update breach status
        await checkBreachStatus([ticket]);
        return res.status(200).json({ ticket });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getTicketByReporter = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in req.user
        const tickets = await Ticket.find({ reporter: userId }).populate('reporter assignee');
        // Check and update breach status
        await checkBreachStatus(tickets);
        return res.status(200).json({ tickets });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getTicketByAssignee = async (req, res) => {
    try {
        const userId = req.user.id; // Assuming user ID is available in req.user    
        const tickets = await Ticket.find({ assignee: userId }).populate('reporter assignee');
        // Check and update breach status
        await checkBreachStatus(tickets);
        return res.status(200).json({ tickets });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const updateTicketStatus = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { status } = req.body;

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        const previousStatus = ticket.status;
        ticket.status = status;
        await ticket.save();

        // Decrement workload when ticket is resolved/closed (if it was previously active)
        if (['RESOLVED', 'CLOSED'].includes(status) &&
            !['RESOLVED', 'CLOSED'].includes(previousStatus) &&
            ticket.assignee) {
            await User.findByIdAndUpdate(ticket.assignee, { $inc: { workloadScore: -1 } });
        }

        // Increment workload if ticket is reopened
        if (!['RESOLVED', 'CLOSED'].includes(status) &&
            ['RESOLVED', 'CLOSED'].includes(previousStatus) &&
            ticket.assignee) {
            await User.findByIdAndUpdate(ticket.assignee, { $inc: { workloadScore: 1 } });
        }

        await ticket.populate('reporter assignee');
        return res.status(200).json({ message: 'Ticket status updated successfully', ticket });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const assignTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { assigneeId } = req.body;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }
        const assignee = await User.findById(assigneeId);
        if (!assignee) {
            return res.status(404).json({ message: 'Assignee user not found' });
        }

        // If previously assigned to someone else, decrement their workload
        if (ticket.assignee && ticket.assignee.toString() !== assigneeId) {
            await User.findByIdAndUpdate(ticket.assignee, { $inc: { workloadScore: -1 } });
        }

        // Only increment workload if this is a new assignment (not reassignment to same person)
        if (!ticket.assignee || ticket.assignee.toString() !== assigneeId) {
            await User.findByIdAndUpdate(assigneeId, { $inc: { workloadScore: 1 } });
        }

        ticket.assignee = assigneeId;
        ticket.status = 'ASSIGNED';
        await ticket.save();

        // Populate for response
        await ticket.populate('reporter assignee');

        // send email notifications
        try {
            // send to assignee
            if (assignee.email) {
                await sendMail({
                    to: assignee.email,
                    subject: `New assignment: ${ticket.title}`,
                    text: `You have been assigned a new ticket: ${ticket.title} - Due: ${ticket.dueDate}`,
                    html: `<p>You have been assigned a new ticket: <strong>${ticket.title}</strong></p><p>Due: ${ticket.dueDate}</p>`
                });
            }
            // send to reporter
            if (ticket.reporter && ticket.reporter.email) {
                await sendMail({
                    to: ticket.reporter.email,
                    subject: `Engineer assigned to your ticket: ${ticket.title}`,
                    text: `Your ticket '${ticket.title}' has been assigned to ${assignee.name} (${assignee.email}).`,
                    html: `<p>Your ticket '<strong>${ticket.title}</strong>' has been assigned to <strong>${assignee.name}</strong> (${assignee.email}).</p>`
                });
            }
        } catch (mailErr) {
            console.error('Email send error:', mailErr);
        }

        return res.status(200).json({ message: 'Ticket assigned successfully', ticket });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const deleteTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Decrement workload if ticket was assigned and not resolved/closed
        if (ticket.assignee && !['RESOLVED', 'CLOSED'].includes(ticket.status)) {
            await User.findByIdAndUpdate(ticket.assignee, { $inc: { workloadScore: -1 } });
        }

        await Ticket.findByIdAndDelete(ticketId);
        return res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const sendDeadlineNotifications = async (req, res) => {
    try {
        // configurable window (hours) from request or default 24 hours
        const hoursWindow = req.body.hours || 24;
        const now = new Date();
        const windowEnd = new Date(now.getTime() + hoursWindow * 60 * 60 * 1000);

        // Find tickets with dueDate within (now, windowEnd), not resolved/closed, has assignee, and not already notified
        const tickets = await Ticket.find({
            assignee: { $ne: null },
            status: { $nin: ['RESOLVED', 'CLOSED'] },
            dueDate: { $gte: now, $lte: windowEnd },
            deadlineNotified: { $ne: true }
        }).populate('assignee reporter');

        const results = [];
        for (const t of tickets) {
            if (t.assignee && t.assignee.email) {
                try {
                    const subject = `Reminder: Time is running out for ticket '${t.title}'`;
                    const text = `The ticket '${t.title}' is due on ${t.dueDate}. Please complete before the deadline.`;
                    const html = `<p>The ticket '<strong>${t.title}</strong>' is due on <strong>${t.dueDate}</strong>. Please complete before the deadline.</p>`;
                    const info = await sendMail({ to: t.assignee.email, subject, text, html });
                    results.push({ ticketId: t._id, to: t.assignee.email, info });

                    // mark notified to prevent duplicates
                    t.deadlineNotified = true;
                    await t.save();
                } catch (err) {
                    console.error('Failed sending deadline mail for ticket', t._id, err);
                    results.push({ ticketId: t._id, error: err.message });
                }
            }
        }

        return res.status(200).json({ message: 'Deadline notifications processed', results });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

