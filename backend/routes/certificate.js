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
router.post("/", adminAuthenticate, certificateController.createCertificate);
router.get("/", adminAuthenticate, certificateController.getAllCertificates);
router.get("/:id", adminAuthenticate, certificateController.getCertificateById);
router.delete(
  "/:id",
  adminAuthenticate,
  certificateController.deleteCertificate
);
module.exports = router;
