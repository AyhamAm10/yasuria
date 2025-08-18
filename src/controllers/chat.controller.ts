import { Request, Response } from "express";
import { AppDataSource } from "../config/data_source";
import { User } from "../entity/User";
import { Chat } from "../entity/chat";

export class ChatController {

   async sendMessage(req: Request, res: Response) {
    try {
      const {  receiverId, message } = req.body;
      const senderId = req.currentUser?.id

      const sender = await AppDataSource.getRepository(User).findOne({ where: { id: senderId } });
      const receiver = await AppDataSource.getRepository(User).findOne({ where: { id: receiverId } });

      if (!sender || !receiver) {
        return res.status(404).json({ message: "Sender or receiver not found" });
      }

      const chatRepo = AppDataSource.getRepository(Chat);
      const newMessage = chatRepo.create({
        sender,
        receiver,
        message,
      });

      await chatRepo.save(newMessage);

      return res.status(201).json(newMessage);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error sending message" });
    }
  }

   async getMessages(req: Request, res: Response) {
    try {
      const {  receiverId } = req.params;
        const senderId = req.currentUser?.id
      const chatRepo = AppDataSource.getRepository(Chat);
      const messages = await chatRepo.find({
        where: [
          { sender: { id: Number(senderId) }, receiver: { id: Number(receiverId) } },
          { sender: { id: Number(receiverId) }, receiver: { id: Number(senderId) } },
        ],
        relations: ["sender", "receiver"],
        order: { createdAt: "ASC" },
      });

      return res.json(messages);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching messages" });
    }
  }

   async getContacts(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id

      const chatRepo = AppDataSource.getRepository(Chat);
      const messages = await chatRepo.find({
        where: [
          { sender: { id: Number(userId) } },
          { receiver: { id: Number(userId) } },
        ],
        relations: ["sender", "receiver"],
      });

      const contacts = new Map<number, User>();

      messages.forEach(msg => {
        if (msg.sender.id !== Number(userId)) {
          contacts.set(msg.sender.id, msg.sender);
        }
        if (msg.receiver.id !== Number(userId)) {
          contacts.set(msg.receiver.id, msg.receiver);
        }
      });

      return res.json(Array.from(contacts.values()));
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching contacts" });
    }
  }
}