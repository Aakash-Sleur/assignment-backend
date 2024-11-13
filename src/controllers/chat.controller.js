import Chat from "../models/chat.model.js";
import { io } from "../index.js";
import User from "../models/user.model.js";

export async function getChats(req, res) {
  try {
    const { userId } = req;
    const chats = await Chat.find({ users: { $in: [userId] } }).populate({
      path: "users",
      model: User,
    });
    res.status(200).json(chats);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}

export async function createChat(req, res) {
  try {
    const { userId } = req;
    const { id } = req.params;

    const chat = await Chat.findOne({
      users: { $all: [userId, id] },
    });

    if (chat) {
      return res.status(200).json(chat);
    }

    const newChat = new Chat({
      users: [userId, id],
    });

    await newChat.save();
    res.status(201).json(newChat);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}

export async function getChatById(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req;

    const chat = await Chat.findOne({
      _id: id,
      users: { $in: [userId] },
    }).populate({
      path: "users",
      model: User,
    });

    if (!chat) {
      return res.status(404).send("Chat not found.");
    }

    res.status(200).json(chat);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}

export async function sendMessage(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req;
    const { message } = req.body;

    const newMessage = {
      sender: userId,
      text: message,
      timestamp: new Date(),
    };

    const updatedChat = await Chat.findByIdAndUpdate(
      id,
      { $push: { messages: newMessage } },
      { new: true }
    ).populate("users", "username");

    if (!updatedChat) {
      return res.status(404).send("Chat not found.");
    }

    io.to(id).emit("new message", {
      chatId: id,
      message: newMessage,
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error");
  }
}
