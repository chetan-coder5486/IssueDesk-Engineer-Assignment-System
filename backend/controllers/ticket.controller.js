import User from "../models/user.model.js";
import Ticket from "../models/ticket.model.js";
import { calculateDueDate, isBreached } from "../models/sla.model.js";
import { sendMail } from "../utils/email.js";

// ==================== ROLE-BASED ACCESS HELPERS ====================

/**
 * Check if user can access a specific ticket
 * - ADMIN: Can access all tickets
 * - ENGINEER: Can access tickets assigned to them
 * - RANGER: Can access tickets they reported
 */
const canAccessTicket = (user, ticket) => {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'ENGINEER' && ticket.assignee?.toString() === user.id.toString()) return true;
    if (user.role === 'RANGER' && ticket.reporter?.toString() === user.id.toString()) return true;
    return false;
};

/**
 * Check if user can modify ticket status
 * - ADMIN: Can modify any ticket status
 * - ENGINEER: Can modify status of tickets assigned to them
 * - RANGER: Cannot modify status (only view)
 */
const canModifyTicketStatus = (user, ticket) => {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'ENGINEER' && ticket.assignee?.toString() === user.id.toString()) return true;
    return false;
};

/**
 * Check if user can delete a ticket
 * - ADMIN: Can delete any ticket
 * - RANGER: Can delete their own ticket ONLY if status is OPEN
 * - ENGINEER: Cannot delete tickets
 */
const canDeleteTicket = (user, ticket) => {
    if (user.role === 'ADMIN') return true;
    if (user.role === 'RANGER' &&
        ticket.reporter?.toString() === user.id.toString() &&
        ticket.status === 'OPEN') return true;
    return false;
};

// ==================== TICKET CONTROLLERS ====================

export const createTicket = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Only RANGER and ADMIN can create tickets
        if (!['RANGER', 'ADMIN'].includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. Only Rangers and Admins can create tickets.',
                success: false
            });
        }

        const { title, description, priority, category } = req.body;
        if (!title) {
            return res.status(400).json({ message: 'Title is required', success: false });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found', success: false });
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

        return res.status(201).json({
            message: 'Ticket created successfully',
            ticket: newTicket,
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message, success: false });
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
        const userRole = req.user.role;

        // Only ADMIN can get all tickets
        if (userRole !== 'ADMIN') {
            return res.status(403).json({
                message: 'Access denied. Only Admins can view all tickets.',
                success: false
            });
        }

        const tickets = await Ticket.find().populate('reporter assignee');
        // Check and update breach status
        await checkBreachStatus(tickets);
        return res.status(200).json({ tickets, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message, success: false });
    }
}

export const getTicketById = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId).populate('reporter assignee');

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found', success: false });
        }

        // Check access permissions
        if (!canAccessTicket(req.user, ticket)) {
            return res.status(403).json({
                message: 'Access denied. You can only view tickets you reported or are assigned to.',
                success: false
            });
        }

        // Check and update breach status
        await checkBreachStatus([ticket]);
        return res.status(200).json({ ticket, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message, success: false });
    }
}

export const getTicketByReporter = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Only RANGER and ADMIN can access this endpoint
        // (Engineers don't "report" tickets, they're assigned to them)
        if (!['RANGER', 'ADMIN'].includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. This endpoint is for Rangers.',
                success: false
            });
        }

        const tickets = await Ticket.find({ reporter: userId }).populate('reporter assignee');
        // Check and update breach status
        await checkBreachStatus(tickets);
        return res.status(200).json({ tickets, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message, success: false });
    }
}

export const getTicketByAssignee = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // Only ENGINEER and ADMIN can access assigned tickets
        if (!['ENGINEER', 'ADMIN'].includes(userRole)) {
            return res.status(403).json({
                message: 'Access denied. This endpoint is for Engineers.',
                success: false
            });
        }

        const tickets = await Ticket.find({ assignee: userId }).populate('reporter assignee');
        // Check and update breach status
        await checkBreachStatus(tickets);
        return res.status(200).json({ tickets, success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message, success: false });
    }
}

export const updateTicketStatus = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { status } = req.body;
        const userRole = req.user.role;

        // Validate status value
        const validStatuses = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_PARTS', 'RESOLVED', 'CLOSED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
                success: false
            });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found', success: false });
        }

        // Check if user can modify this ticket's status
        if (!canModifyTicketStatus(req.user, ticket)) {
            return res.status(403).json({
                message: 'Access denied. Only the assigned engineer or an admin can update ticket status.',
                success: false
            });
        }

        // Additional validation: Rangers cannot update status at all
        if (userRole === 'RANGER') {
            return res.status(403).json({
                message: 'Access denied. Rangers cannot update ticket status.',
                success: false
            });
        }

        // Prevent setting to ASSIGNED without an assignee
        if (status === 'ASSIGNED' && !ticket.assignee) {
            return res.status(400).json({
                message: 'Cannot set status to ASSIGNED without an assignee.',
                success: false
            });
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
        return res.status(200).json({
            message: 'Ticket status updated successfully',
            ticket,
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message, success: false });
    }
}

export const assignTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { assigneeId } = req.body;
        const userRole = req.user.role;

        // Only ADMIN can assign tickets
        if (userRole !== 'ADMIN') {
            return res.status(403).json({
                message: 'Access denied. Only Admins can assign tickets.',
                success: false
            });
        }

        if (!assigneeId) {
            return res.status(400).json({
                message: 'Assignee ID is required.',
                success: false
            });
        }

        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found', success: false });
        }

        const assignee = await User.findById(assigneeId);
        if (!assignee) {
            return res.status(404).json({ message: 'Assignee user not found', success: false });
        }

        // Verify assignee is an ENGINEER
        if (assignee.role !== 'ENGINEER') {
            return res.status(400).json({
                message: 'Tickets can only be assigned to Engineers.',
                success: false
            });
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

        return res.status(200).json({
            message: 'Ticket assigned successfully',
            ticket,
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message, success: false });
    }
}

export const deleteTicket = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            return res.status(404).json({ message: 'Ticket not found', success: false });
        }

        // Check if user can delete this ticket
        if (!canDeleteTicket(req.user, ticket)) {
            // Provide specific error message based on role
            if (req.user.role === 'RANGER') {
                if (ticket.reporter?.toString() !== req.user.id.toString()) {
                    return res.status(403).json({
                        message: 'Access denied. You can only delete your own tickets.',
                        success: false
                    });
                } else {
                    return res.status(403).json({
                        message: 'Access denied. You can only delete tickets that are still OPEN.',
                        success: false
                    });
                }
            }
            if (req.user.role === 'ENGINEER') {
                return res.status(403).json({
                    message: 'Access denied. Engineers cannot delete tickets.',
                    success: false
                });
            }
            return res.status(403).json({
                message: 'Access denied. You do not have permission to delete this ticket.',
                success: false
            });
        }

        // Decrement workload if ticket was assigned and not resolved/closed
        if (ticket.assignee && !['RESOLVED', 'CLOSED'].includes(ticket.status)) {
            await User.findByIdAndUpdate(ticket.assignee, { $inc: { workloadScore: -1 } });
        }

        await Ticket.findByIdAndDelete(ticketId);
        return res.status(200).json({ message: 'Ticket deleted successfully', success: true });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message, success: false });
    }
}

export const sendDeadlineNotifications = async (req, res) => {
    try {
        const userRole = req.user.role;

        // Only ADMIN can trigger deadline notifications
        if (userRole !== 'ADMIN') {
            return res.status(403).json({
                message: 'Access denied. Only Admins can trigger deadline notifications.',
                success: false
            });
        }

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

        return res.status(200).json({
            message: 'Deadline notifications processed',
            results,
            success: true
        });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message, success: false });
    }
}

