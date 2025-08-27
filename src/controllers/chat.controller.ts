import { Request, Response } from "express";
import { AppDataSource } from "../config/data_source";
import { User } from "../entity/User";
import { Chat } from "../entity/chat";

export class ChatController {
  async sendMessage(req: Request, res: Response) {
    try {
      const { receiverId, message , images } = req.body;
      const senderId = req.currentUser?.id;

      const sender = await AppDataSource.getRepository(User).findOne({
        where: { id: senderId },
      });
      const receiver = await AppDataSource.getRepository(User).findOne({
        where: { id: receiverId },
      });

      if (!sender || !receiver) {
        return res
          .status(404)
          .json({ message: "Sender or receiver not found" });
      }

      const imageList: string[] = Array.isArray(images) ? images : [];

      const chatRepo = AppDataSource.getRepository(Chat);
      const newMessage = chatRepo.create({
        sender,
        receiver,
        message,
        images:imageList,
      });

      await chatRepo.save(newMessage);

      return res.status(201).json(newMessage);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error sending message" });
    }
  }

  // async getMessages(req: Request, res: Response) {
  //   try {
  //     const { receiverId } = req.params;
  //     const senderId = req.currentUser?.id;
  //     const chatRepo = AppDataSource.getRepository(Chat);
  //     const messages = await chatRepo.find({
  //       where: [
  //         {
  //           sender: { id: Number(senderId) },
  //           receiver: { id: Number(receiverId) },
  //         },
  //         {
  //           sender: { id: Number(receiverId) },
  //           receiver: { id: Number(senderId) },
  //         },
  //       ],
  //       relations: ["sender", "receiver"],
  //       order: { createdAt: "ASC" },
  //     });

  //     return res.json(messages);
  //   } catch (error) {
  //     console.error(error);
  //     return res.status(500).json({ message: "Error fetching messages" });
  //   }
  // }

  async getMessages(req: Request, res: Response) {
    try {
      const { receiverId } = req.params;
      const senderId = req.currentUser?.id;

      // pagination
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const skip = (page - 1) * limit;

      const chatRepo = AppDataSource.getRepository(Chat);

      const [messages, total] = await chatRepo
        .createQueryBuilder("chat")
        .leftJoinAndSelect("chat.sender", "sender")
        .leftJoinAndSelect("chat.receiver", "receiver")
        .where(
          "(chat.senderId = :senderId AND chat.receiverId = :receiverId) OR (chat.senderId = :receiverId AND chat.receiverId = :senderId)",
          { senderId, receiverId }
        )
        .orderBy("chat.createdAt", "DESC")
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return res.json({
        data: messages,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Error fetching messages" });
    }
  }

  async getContacts(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;

      const chatRepo = AppDataSource.getRepository(Chat);
      const messages = await chatRepo.find({
        where: [
          { sender: { id: Number(userId) } },
          { receiver: { id: Number(userId) } },
        ],
        relations: ["sender", "receiver"],
      });

      const contacts = new Map<number, User>();

      messages.forEach((msg) => {
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

  async getContactsWithLastMessage(req: Request, res: Response) {
    try {
      const userId = req.currentUser?.id;

      const chatRepo = AppDataSource.getRepository(Chat);

      const subQuery = chatRepo
        .createQueryBuilder("c")
        .select("MAX(c.id)", "maxId")
        .where("c.senderId = :userId OR c.receiverId = :userId", { userId })
        .groupBy(`
        CASE 
          WHEN c.senderId < c.receiverId THEN CONCAT(c.senderId, '-', c.receiverId) 
          ELSE CONCAT(c.receiverId, '-', c.senderId) 
        END
      `);

      const lastMessages = await chatRepo
        .createQueryBuilder("chat")
        .leftJoinAndSelect("chat.sender", "sender")
        .leftJoinAndSelect("chat.receiver", "receiver")
        .where(`chat.id IN (${subQuery.getQuery()})`)
        .setParameters(subQuery.getParameters())
        .orderBy("chat.createdAt", "DESC")
        .getMany();

      return res.json(
        lastMessages.map((msg) => {
          const contact =
            msg.sender.id === Number(userId) ? msg.receiver : msg.sender;
          return {
            contact,
            lastMessage: {
              id: msg.id,
              message: msg.message,
              images: msg.images,
              createdAt: msg.createdAt,
            },
          };
        })
      );
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Error fetching contacts with last messages" });
    }
  }
}
