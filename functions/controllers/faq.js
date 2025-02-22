const router = require("express").Router();
const { faqs } = require("../models");

// ✅ Get all active FAQs
router.get("/", async (req, res) => {
  try {
    const response = await faqs.find({ isActive: true });
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch FAQs", error });
  }
});

router.get("/allFAQ", async (req, res) => {
  try {
    const FAQs = await faqs.find({});
    res.status(200).json(FAQs);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch FAQs", error });
  }
});

// ✅ Get a single faqs by ID from query
router.get("/faq", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "ID is required" });
    const faq = await faqs.findById(id);
    if (!faq) return res.status(404).json({ message: "faqs not found" });
    res.json(faq);
  } catch (error) {
    res.status(500).json({ message: "Error fetching faqs", error });
  }
});

// ✅ Add a new faqs
router.post("/addFaq", async (req, res) => {
  try {
    const { question, answer, category, createdBy } = req.body;
    const newFAQ = new faqs({ question, answer, category, createdBy });
    await newFAQ.save();
    res.status(201).json(newFAQ);
  } catch (error) {
    res.status(400).json({ message: "Failed to add faqs", error });
  }
});

// ✅ Edit an existing faqs using query
router.put("/update-faq-by-id", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "ID is required" });
    const updatedFAQ = await faqs.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!updatedFAQ) return res.status(404).json({ message: "faqs not found" });
    res.json(updatedFAQ);
  } catch (error) {
    res.status(400).json({ message: "Failed to update faqs", error });
  }
});

// ✅ Delete an faqs (Permanent Removal) using query
router.delete("/delete-faq-by-id", async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "ID is required" });
    const deletedFAQ = await faqs.findByIdAndDelete(id);
    if (!deletedFAQ) return res.status(404).json({ message: "faqs not found" });
    res.json({ message: "faqs deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete faqs", error });
  }
});

// ✅ Disable an faqs (Soft Delete) using query
router.patch("/disable-faq", async (req, res) => {
  try {
    const { id, isActive = false } = req.query;
    if (!id) return res.status(400).json({ message: "ID is required" });
    const disabledFAQ = await faqs.findByIdAndUpdate(
      id,
      { isActive: isActive },
      { new: true }
    );
    if (!disabledFAQ)
      return res.status(404).json({ message: "faqs not found" });
    res.json({ message: "faqs disabled successfully", disabledFAQ });
  } catch (error) {
    res.status(500).json({ message: "Failed to disable faqs", error });
  }
});

module.exports = router;
