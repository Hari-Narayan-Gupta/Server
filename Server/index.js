import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import AuthRoute from './Routes/AuthRoute.js'
import UserRoute from './Routes/UserRoute.js'
import PostRoute from './Routes/PostRoute.js'
import UploadRoute from './Routes/UploadRoute.js'
import ChatRoute from './Routes/ChatRoute.js'
import MessageRoute from './Routes/MessageRoute.js'
import NotificationRoute from './Routes/NotificationRoute.js'
import punycode from "punycode";
import UserModel from './Models/userModel.js';
import NotificationModel from './Models/notificationModel.js';
import { createNotification } from './Controllers/NotificationController.js'
import { markMessageAsRead } from './Controllers/MessageController.js';
//import { type } from './Models/notificationModel.js'
// Routes



dotenv.config();
const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000' // for local testing
];

app.use(cors({
  origin: function (origin, callback) {
    // Remove trailing slash from the incoming origin, if any, and check against allowedOrigins
    const sanitizedOrigin = origin ? origin.replace(/\/$/, '') : '';
    if (!origin || allowedOrigins.includes(sanitizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true
  },
});

let activeUsers = [];

io.on("connection", (socket) => {
  // add new User
  socket.on("new-user-add", async (newUserId) => {
    // if user is not added previously
    if (!activeUsers.some((user) => user.userId === newUserId)) {
      activeUsers.push({ userId: newUserId, socketId: socket.id });
      console.log("New User Connected", activeUsers);

      // ole.log(user)

      await UserModel.findByIdAndUpdate({ _id: newUserId }, { $set: { is_online: "1" } });
      //console.log("this is data"+userData);



    }
    // send all active users to new user
    io.emit("get-users", activeUsers);
  });

  socket.on("disconnect", async () => {
    // remove user from active users
    //activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);

    const disconnectedUser = activeUsers.find((user) => user.socketId === socket.id);
    //console.log(user)
    //console.log("User Disconnected", activeUsers);
    if (disconnectedUser) {
      // remove user from active users
      activeUsers = activeUsers.filter((user) => user.socketId !== socket.id);
      console.log("User Disconnected", activeUsers);

      // Update user's is_online status to "0" when they disconnect
      await UserModel.findByIdAndUpdate(disconnectedUser.userId, { $set: { is_online: "0" } });
      console.log("User's is_online status updated to 0");
    }
    io.emit("get-users", activeUsers);

  });

  // send message to a specific user
  socket.on("send-message", async (data) => {
    const { receiverId } = data;
    const user = activeUsers.find((user) => user.userId === receiverId);
    //console.log("Sending from socket to :", receiverId);
    // console.log("Data: ", data);
    if (user) {
      io.to(user.socketId).emit("recieve-message", data);
    }
  });
});

// to serve images inside public folder
app.use(express.static('public'));
app.use('/images', express.static('images'));

app.get('/images/default', (req, res) => {
  // Set the path to your default image
  const defaultImagePath = path.join(__dirname, 'public', 'good.jpg');

  // Send the default image as a response
  res.sendFile(defaultImagePath);
});

// Middleware
app.use(bodyParser.json({ limit: '30mb', extended: true })); // for parsing application/json
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }))
app.use(cors());

// Connect to MongoDB
mongoose.connect(
  process.env.MONGO_DB,
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
  server.listen(process.env.PORT, () => {
    console.log('Server is running on port:', process.env.PORT);
    console.log('MongoDB connected');
  });
})
  .catch((error) => console.log(error));
   

// usage of routes
app.use('/auth', AuthRoute)
app.use('/user', UserRoute)
app.use('/post', PostRoute)
app.use('/upload', UploadRoute)
app.use('/chat', ChatRoute)
app.use('/message', MessageRoute)
app.use('/notification', NotificationRoute)
