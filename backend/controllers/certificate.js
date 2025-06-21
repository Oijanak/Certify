const Certificate = require("../models/Cerificate");
const fs = require("fs");
const path = require("path");

const User = require("../models/User");

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

    // Push the certificate to the user's certificates array
    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { certificates: certificate._id } },
      { new: true }
    );

    res.status(201).json(certificate);
  } catch (error) {
    console.error(error); // for debugging
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

exports.updatePendingRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, certificateType, keepAttachments } = req.body;
    const userId = req.user.id;

    // Find existing certificate
    const certificate = await Certificate.findOne({ _id: id, user: userId });
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Get existing attachments to keep
    const attachmentsToKeep = Array.isArray(keepAttachments)
      ? keepAttachments
      : keepAttachments
      ? [keepAttachments]
      : [];

    // Get new attachments
    const newAttachments = req.files?.map((file) => file.filename) || [];

    // Combine kept and new attachments
    const allAttachments = [...attachmentsToKeep, ...newAttachments];

    // Delete files that were removed
    if (certificate.documentUrl) {
      const existingFiles = certificate.documentUrl.split(",");
      const filesToDelete = existingFiles.filter(
        (file) => !attachmentsToKeep.includes(file)
      );

      filesToDelete.forEach((file) => {
        const filePath = path.join("uploads/certifications", file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    // Update certificate
    certificate.title = title;
    certificate.certificateType = certificateType;
    certificate.requestedDate = Date.now();
    certificate.documentUrl = allAttachments.join(",");
    certificate.status = "pending"; // Reset status when updating

    await certificate.save();
    res.json(certificate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { rejectionReason } = req.body;
  try {
    const certificate = await Certificate.findById(id);
    (certificate.status = "rejected"),
      (certificate.rejectionReason = rejectionReason);
    await certificate.save();
    res.json.status(200);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserWithCertificates = async (req, res) => {
  try {
    const { userId } = req.params; // or get from req.params.id if you're accessing another user

    const user = await User.findById(userId)
      .populate("certificates") // This populates certificate data
      .select("-password"); // Optionally exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching user with certificates:", err);
    res.status(500).json({ message: "Server error" });
  }
};
