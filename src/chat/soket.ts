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
        const { senderId, receiverId, message, images = [] } = data;

        const sender = await AppDataSource.getRepository(User).findOne({
          where: { id: senderId },
        });
        const receiver = await AppDataSource.getRepository(User).findOne({
          where: { id: receiverId },
        });

        if (!sender || !receiver) return;

        const chatRepo = AppDataSource.getRepository(Chat);
        const newMessage = chatRepo.create({
          sender,
          receiver,
          message,
          images,
        });

        await chatRepo.save(newMessage);

        const receiverSocketId = onlineUsers.get(receiverId);
        if (receiverSocketId)
          io.to(receiverSocketId).emit("message", newMessage);

        const senderSocketId = onlineUsers.get(senderId);
        if (senderSocketId) io.to(senderSocketId).emit("message", newMessage);
      } catch (error) {
        console.error(error);
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

// const onlineUsers = new Map<number, string>(); // userId -> socketId

// io.on("connection", (socket) => {
//   console.log("🔗 User connected", socket.id);

//   // When a user registers
//   socket.on("register", (userId: number) => {
//     onlineUsers.set(userId, socket.id);
//     console.log(✅ Registered user ${userId} with socket ${socket.id});
//   });

//   // When user sends a message
//   socket.on("sendMessage", (data) => {
//     const { senderId, receiverId, message } = data;
//     console.log("📤 Message received from client:", data);

//     // Find receiver
//     const receiverSocketId = onlineUsers.get(receiverId);
//     if (receiverSocketId) {
//       // Send to receiver only
//       io.to(receiverSocketId).emit("message", {
//         id: Date.now(), // fake id
//         message,
//         sender: { id: senderId },
//         receiver: { id: receiverId },
//       });
//       console.log(📩 Delivered to user ${receiverId});
//     } else {
//       console.log(⚠️ User ${receiverId} is offline);
//     }
//   });

//   // Handle disconnect
//   socket.on("disconnect", () => {
//     for (const [userId, sid] of onlineUsers.entries()) {
//       if (sid === socket.id) {
//         onlineUsers.delete(userId);
//         console.log(❌ User ${userId} disconnected);
//       }
//     }
//   });
// });
