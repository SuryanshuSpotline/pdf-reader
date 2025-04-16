import axios from "axios";

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("pdf", file);

  try {
    const response = await axios.post(
      "https://pdf-reader-9eok.onrender.com/upload",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    if (response.data.url && response.data.originalName) {
      return {
        url: `https://pdf-reader-9eok.onrender.com${response.data.url}`,
        name: response.data.originalName,
      };
    } else {
      console.error("Upload failed.");
      return null;
    }
  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
};