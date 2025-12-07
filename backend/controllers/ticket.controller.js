import User from "../models/user.model";
import Ticket from "../models/ticket.model.js";

export const createTicket = async(req,res)=>{
    try{
        const userId = req.user.id; // Assuming user ID is available in req.user
        const { title, description, priority } = req.body;
        if(!title || !priority){
            return res.status(400).json({ message: 'Title and Priority are required' });
        }
        if(User.findById(userId) == null){
            return res.status(404).json({ message: 'User not found' });
        }
        const newTicket = new Ticket({
            title,
            description,
            priority,
            reporter : userId
        });
        await newTicket.save();
        return res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getAllTickets = async(req,res)=>{
    try{
        const tickets = await Ticket.find().populate('reporter assignee');
        return res.status(200).json({ tickets });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getTicketById = async(req,res)=>{
    try{
        const ticketId = req.params.id;
        const ticket = await Ticket.findById(ticketId).populate('reporter assignee');
        if(!ticket){
            return res.status(404).json({ message: 'Ticket not found' });
        }
        return res.status(200).json({ ticket });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getTicketByReporter = async(req,res)=>{
    try{
        const userId = req.user.id; // Assuming user ID is available in req.user
        const tickets = await Ticket.find({ reporter: userId }).populate('reporter assignee');
        return res.status(200).json({ tickets });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const getTicketByAssignee = async(req,res)=>{
    try{
        const userId = req.user.id; // Assuming user ID is available in req.user    
        const tickets = await Ticket.find({ assignee: userId }).populate('reporter assignee');
        return res.status(200).json({ tickets });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const updateTicketStatus = async(req,res)=>{
    try{        
        const ticketId = req.params.id;
        const { status } = req.body;

        const ticket = await Ticket.findById(ticketId);
        if(!ticket){
            return res.status(404).json({ message: 'Ticket not found' });
        }
        ticket.status = status;
        await ticket.save();
        return res.status(200).json({ message: 'Ticket status updated successfully', ticket });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const assignTicket = async(req,res)=>{
    try{        
        const ticketId = req.params.id;
        const { assigneeId } = req.body;    
        const ticket = await Ticket.findById(ticketId);
        if(!ticket){
            return res.status(404).json({ message: 'Ticket not found' });
        }   
        const assignee = await User.findById(assigneeId);
        if(!assignee){
            return res.status(404).json({ message: 'Assignee user not found' });
        }
        ticket.assignee = assigneeId;
        ticket.status = 'ASSIGNED';
        await ticket.save();
        return res.status(200).json({ message: 'Ticket assigned successfully', ticket });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}

export const deleteTicket = async(req,res)=>{
    try{        
        const ticketId = req.params.id;        
        const ticket = await Ticket.findById(ticketId);
        if(!ticket){
            return res.status(404).json({ message: 'Ticket not found' });
        }
        await Ticket.findByIdAndDelete(ticketId);
        return res.status(200).json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
}   

