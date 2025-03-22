import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const imageUrls = [
  "https://images.unsplash.com/photo-1560807707-8cc77767d783",
  "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0",
  "https://images.unsplash.com/photo-1518733057094-95b53143d2a7",
  "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb",
  "https://images.unsplash.com/photo-1574158622682-e40e69881006",
  "https://images.unsplash.com/photo-1561948955-570b270e7c36",
  "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb",
  "https://images.unsplash.com/photo-1574169208507-84376144848b"
];

const PinterestClone = () => {
  const [images, setImages] = useState(imageUrls.map(url => ({ src: url, likes: 0 })));
  const [newImage, setNewImage] = useState("");
  const [darkMode, setDarkMode] = useState(false);

  const addImage = () => {
    if (newImage.trim()) {
      setImages([{ src: newImage, likes: 0 }, ...images]);
      setNewImage("");
    }
  };

  const likeImage = (index) => {
    setImages((prevImages) =>
      prevImages.map((img, i) =>
        i === index ? { ...img, likes: img.likes + 1 } : img
      )
    );
  };

  const deleteImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const loadMoreImages = () => {
    const newImages = imageUrls.map(url => ({
      src: url,
      likes: 0
    }));
    setImages((prevImages) => [...prevImages, ...newImages]);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        loadMoreImages();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: darkMode ? "#333" : "#f4f4f4",
      color: darkMode ? "white" : "black",
      padding: "20px",
      transition: "background-color 0.3s ease",
    }}>
      <h1 style={{ textAlign: "center", fontSize: "24px", marginBottom: "20px" }}>Pinterest Clone</h1>
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Enter image URL"
          value={newImage}
          onChange={(e) => setNewImage(e.target.value)}
          style={{ width: "300px", padding: "10px", borderRadius: "5px", border: "1px solid #ccc" }}
        />
        <button onClick={addImage} style={{ backgroundColor: "#007bff", color: "white", padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer" }}>Add</button>
        <button onClick={() => setDarkMode(!darkMode)} style={{ backgroundColor: darkMode ? "#f4f4f4" : "#333", color: darkMode ? "black" : "white", padding: "10px 15px", borderRadius: "5px", border: "none", cursor: "pointer" }}>Toggle Mode</button>
      </div>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "10px",
        justifyContent: "center",
      }}>
        {images.map((image, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            style={{ position: "relative", borderRadius: "15px", overflow: "hidden", backgroundColor: darkMode ? "#444" : "white", boxShadow: "0px 4px 6px rgba(0,0,0,0.1)" }}
          >
            <img
              src={image.src}
              alt={`Pin ${index}`}
              style={{ width: "100%", height: "200px", objectFit: "cover", display: "block" }}
            />
            <div style={{ padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={() => likeImage(index)}
                style={{ color: "#007bff", fontSize: "14px", fontWeight: "bold", border: "none", background: "none", cursor: "pointer" }}
              >
                ❤️ {image.likes}
              </button>
              <button
                onClick={() => deleteImage(index)}
                style={{ color: "red", fontSize: "14px", fontWeight: "bold", border: "none", background: "none", cursor: "pointer" }}
              >
                🗑
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PinterestClone;
