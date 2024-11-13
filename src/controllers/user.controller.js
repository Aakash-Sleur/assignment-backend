import User from "../models/user.model.js";
import { getTransporter } from "../utils/transporter.js";

export async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .populate({
        path: "followers",
        model: User,
      })
      .populate({
        path: "following",
        model: User,
      });
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function updateUser(req, res) {
  try {
    const { ...data } = req.body;
    const { userId } = req;
    const user = await User.findByIdAndUpdate(userId, data, { new: true });
    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function followUser(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req;

    // Find the user to be followed/unfollowed
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const hasFollowed = user.followers.includes(userId);
    const operation = hasFollowed ? "$pull" : "$push";
    const action = hasFollowed ? "unfollowed" : "followed";
    const subject = `${
      action.charAt(0).toUpperCase() + action.slice(1)
    } Notification`;
    const text = `You have been ${action} by a user.`;

    // Update the followers and following lists
    await User.findByIdAndUpdate(id, { [operation]: { followers: userId } });
    await User.findByIdAndUpdate(userId, { [operation]: { following: id } });

    const transporter = getTransporter();

    // Send notification email
    const mailData = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Notification: ${subject}`,
      html: `<b>${text}</b>`,
    };

    await transporter.sendMail(mailData);

    res.status(200).json({ message: `User has been ${action}.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
