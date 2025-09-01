// controllers/subscribeController.js
import fs from "fs";
import path from "path";

export const subscribeUser = async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ message: "Email is required" });

  try {
    // Save emails in a simple file (or DB if you prefer)
    const filePath = path.join(process.cwd(), "subscribers.txt");
    fs.appendFileSync(filePath, email + "\n");

    res.status(200).json({ message: "Subscribed successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save email" });
  }
};
