const Certificate = require("../models/Cerificate");

exports.requestCertificate = async (req, res) => {
  try {
    const { title, certificateType } = req.body;

    const certificate = new Certificate({
      title,
      certificateType,
      requestedDate: Date.now(),
      documentUrl: req.fileNames.join(","),
      user: req.user.id,
    });
    await certificate.save();
    res.status(201).json(certificate);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.createCertificate = async (req, res) => {
  try {
    const {
      title,
      course,
      recipientName,
      user,
      certificateId, // PDF/Image URL
      instituteName,
      status,
    } = req.body;

    const certificate = new Certificate({
      title,
      course,
      recipientName,
      user,
      certificateId,
      instituteName,
      status,
    });

    await certificate.save();
    res.status(201).json(certificate);
  } catch (error) {
    console.error("Error creating certificate:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().populate(
      "user",
      "_id email publicAddress course"
    );
    res.json(certificates);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get certificate by ID
exports.getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findById(req.params.id).populate(
      "user",
      "_id name email publicAddress rollNo course"
    );
    if (!certificate)
      return res.status(404).json({ message: "Certificate not found" });
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete certificate
exports.deleteCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findByIdAndDelete(req.params.id);
    if (!cert)
      return res.status(404).json({ message: "Certificate not found" });
    res.json({ message: "Certificate deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
