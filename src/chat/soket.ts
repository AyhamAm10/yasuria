import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import { AppDataSource } from "../config/data_source";
import { User } from "../entity/User";
import { Chat } from "../entity/chat";

const onlineUsers = new Map<number, string>(); // userId -> socketId

export const initChatSocket = (server: HttpServer) => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`⚡ New connection: ${socket.id}`);

    socket.on("register", (userId: number) => {
      onlineUsers.set(userId, socket.id);
      console.log(`✅ User ${userId} registered with socket ${socket.id}`);
    });

    socket.on("sendMessage", async (data) => {
      try {
        const { senderId, receiverId, message } = data;

        const sender = await AppDataSource.getRepository(User).findOne({
          where: { id: senderId },
        });
        const receiver = await AppDataSource.getRepository(User).findOne({
          where: { id: receiverId },
        });

        if (!sender || !receiver) {
          console.log("Sender or receiver not found");
          return;
        }

        const chatRepo = AppDataSource.getRepository(Chat);
        const newMessage = chatRepo.create({
          sender,
          receiver,
          message,
        });
        await chatRepo.save(newMessage);

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("message", newMessage);
        }
        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit("message", newMessage);
        }

        console.log("📩 Message saved and sent:", newMessage);
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      for (const [userId, sId] of onlineUsers.entries()) {
        if (sId === socket.id) {
          onlineUsers.delete(userId);
          console.log(` User ${userId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};
