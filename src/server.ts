
import { createServer } from "http";
import { Server } from "socket.io";
import { app } from "./app.js";
import { envVars } from "./app/config/env.config.js";
import { prisma } from "./app/config/prisma.config.js";

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: [envVars.CLIENT_URL, "http://localhost:3000"],
        credentials: true
    }
});

// Basic Socket.io implementation
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    socket.on("join", (userId: string) => {
        socket.join(userId);
        console.log(`User ${userId} joined their private room.`);
    });

    socket.on("sendMessage", (data: { senderId: string, receiverId: string, content: string }) => {
        // Broadcast to receiver's private room
        io.to(data.receiverId).emit("receiveMessage", data);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

const startServer = async () => {
    try {
        httpServer.listen(envVars.PORT, () => {
            console.log(`Server is listening to port ${envVars.PORT}`);
        });

        // Initialize system config if it doesn't exist
        try {
            await prisma.systemConfig.upsert({
                where: { id: "singleton" },
                update: {},
                create: {
                    id: "singleton",
                    isMultiVendorEnabled: true,
                    platformCommission: 10.0,
                },
            });
        } catch (dbError) {
            console.warn("Database connection not available for SystemConfig initialization. Set DATABASE_URL in .env");
        }

    } catch (error) {
        console.log('Error while starting server.', error);
    }
};

startServer();

export { io };
