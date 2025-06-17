const Certificate = require("../models/Cerificate");
const fs = require("fs");
const path = require("path");

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

exports.updateCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      issuedDate,
      recipientName,
      ipfsId,
      oraganizationName,
      status,
      transactionId,
      issuer,
    } = req.body;

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Delete files listed in documentUrl
    if (certificate.documentUrl) {
      const fileNames = certificate.documentUrl.split(",").map((f) => f.trim());
      fileNames.forEach((fileName) => {
        const filePath = path.join(
          __dirname,
          "../uploads/certifications",
          fileName
        );
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error deleting file ${fileName}:`, err.message);
          } else {
            console.log(`Deleted file: ${fileName}`);
          }
        });
      });
    }

    // Update fields
    certificate.recipientName = recipientName;
    certificate.issuedDate = issuedDate;
    certificate.ipfsId = ipfsId;
    certificate.organizationName = oraganizationName;
    certificate.status = status;
    certificate.transactionId = transactionId;
    certificate.issuer = issuer;
    certificate.documentUrl = null; // Clear document URLs

    await certificate.save();

    res.status(200).json(certificate);
  } catch (error) {
    console.error("Error updating certificate:", error);
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
