import { create } from "ipfs-http-client";

const ipfs = create({
  host: "localhost",
  port: "5001",
  protocol: "http",
});

export const addFileToIPFS = async (file) => {
  try {
    const result = await ipfs.add(file);
    console.log("File added:", result);
    return result.path; // CID
  } catch (err) {
    console.error("Error uploading file to IPFS:", err);
    return null;
  }
};
