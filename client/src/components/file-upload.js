import axios from "axios";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      "https://pdf-reader-server.vercel.app/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.data.fileId) {
      return `https://drive.google.com/uc?id=${response.data.fileId}`;
    } else {
      console.error("Upload failed.");
      return null;
    }
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};