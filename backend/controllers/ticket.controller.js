import User from "../models/user.model.js";
import Ticket from "../models/ticket.model.js";
import { calculateDueDate, isBreached } from "../models/sla.model.js";

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

