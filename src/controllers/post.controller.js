import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";
import User from "../models/user.model.js";
import { getTransporter } from "../utils/transporter.js";

export async function createPost(req, res) {
  try {
    const { postContent, imageUrl } = req.body;
    const { userId } = req;

    if (!postContent) {
      return res.status(400).json({ error: "Post content is required." });
    }

    const newPost = new Post({
      postContent,
      user: userId,
      imageUrl: imageUrl || "",
    });

    if (!newPost) {
      return res.status(400).json({ error: "Post creation failed." });
    }

    await newPost.save();
    res.status(201).json({ message: "Post has been created." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getPosts(req, res) {
  try {
    const posts = await Post.find()
      .populate({
        path: "user",
        model: User,
      })
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getPostById(req, res) {
  try {
    const { id } = req.params;
    const post = await Post.findById(id)
      .populate({
        path: "user",
        model: User,
      })
      .populate({
        path: "comments",
        model: Comment,
        populate: {
          path: "user",
          model: User,
        },
      });

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function commentPost(req, res) {
  try {
    const { id } = req.params;
    const { commentText } = req.body;
    const { userId } = req;

    if (!commentText) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    const newComment = new Comment({
      commentText,
      user: userId,
      post: id,
    });

    if (!newComment) {
      return res.status(400).json({ error: "Comment creation failed." });
    }

    await newComment.save();

    await Post.findByIdAndUpdate(id, {
      $push: { comments: newComment._id },
    });

    const post = await Post.findById(id);
    const user = await User.findById(post.user);
    const transporter = getTransporter();

    const mailData = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Notification: Post comment`,
      html: `<b>Somebody Commented on your post</b>`,
    };

    await transporter.sendMail(mailData);

    res.status(201).json({ message: "Comment has been created." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function getPostsByUserId(req, res) {
  try {
    const { id } = req.params;
    const posts = await Post.find({ user: id }).sort({ createdAt: -1 });
    return res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

export async function likePost(req, res) {
  try {
    const { id } = req.params;
    const { userId } = req;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }

    const hasLiked = post.likes.includes(userId);
    const operation = hasLiked ? "$pull" : "$push";
    const action = hasLiked ? "unliked" : "liked";

    await Post.findByIdAndUpdate(id, { [operation]: { likes: userId } });

    const user = await User.findById(post.user);
    const subject = `Post ${
      action.charAt(0).toUpperCase() + action.slice(1)
    } Notification`;
    const text = `Your post has been ${action} by a user.`;

    const transporter = getTransporter();

    const mailData = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: `Notification: ${subject}`,
      html: `<b>${text}</b>`,
    };

    await transporter.sendMail(mailData);

    res.status(200).json({ message: `Post has been ${action}.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
