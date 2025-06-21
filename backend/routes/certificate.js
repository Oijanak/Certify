const express = require("express");
const router = express.Router();
const certificateController = require("../controllers/certificate");
const {
  adminAuthenticate,
  userAuthenticate,
} = require("../middlewares/authenticate");
const createUploader = require("../utils/uploadFile");

const upload = createUploader("certifications");
router.post(
  "/request",
  userAuthenticate,
  upload.array("attachments", 2),
  certificateController.requestCertificate
);
router.put(
  "/request/:id",
  userAuthenticate,
  upload.array("attachments"),
  certificateController.updatePendingRequest
);
router.put("/status/:id", userAuthenticate, certificateController.updateStatus);
router.post("/:id", adminAuthenticate, certificateController.updateCertificate);
router.get("/", adminAuthenticate, certificateController.getAllCertificates);
router.get("/:id", adminAuthenticate, certificateController.getCertificateById);
router.delete(
  "/:id",
  adminAuthenticate,
  certificateController.deleteCertificate
);
router.get(
  "/user/:userId",
  adminAuthenticate,
  certificateController.getUserWithCertificates
);
module.exports = router;
