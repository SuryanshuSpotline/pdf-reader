import axios from "axios";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await axios.post(
      "https://pdf-reader-9eok.onrender.com/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.data.url) {
      return `https://pdf-reader-9eok.onrender.com${response.data.url}`;
    } else {
      console.error("Upload failed.");
      return null;
    }
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};