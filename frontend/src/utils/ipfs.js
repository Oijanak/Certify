import { create } from "ipfs-http-client";

const ipfs = create({
  host: "localhost",
  port: "5001",
  protocol: "http",
});

export const addFileToIPFS = async (file) => {
  try {
    if (file instanceof Blob) {
      const result = await ipfs.add(file);
      console.log("Blob file added:", result.cid.toString());
      return result.cid.toString();
    }
    // For File objects (from file input/dropzone)
    else if (file instanceof File) {
      const result = await ipfs.add(file);
      console.log("File added:", result.cid.toString());
      return result.cid.toString();
    }
  } catch (err) {
    console.error("Error uploading file to IPFS:", err);
    return null;
  }
};
