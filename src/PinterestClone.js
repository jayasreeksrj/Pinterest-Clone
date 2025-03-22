import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaHeart, FaTrash, FaStar, FaSun, FaMoon, FaSearch, FaFilter, FaShareAlt, FaDownload, FaExpand, FaTags, FaBookmark, FaRandom, FaPlus } from "react-icons/fa";

// Generate random images from Picsum
const generateRandomImage = () =>
  `https://picsum.photos/300/400?random=${Math.floor(Math.random() * 1000)}`;

// Categories for images
const categories = ["Nature", "Architecture", "Food", "Travel", "Animals", "Art"];

const PinterestClone = () => {
  const [images, setImages] = useState(
    Array.from({ length: 20 }, () => ({
      src: generateRandomImage(),
      likes: Math.floor(Math.random() * 100),
      favorite: false,
      category: categories[Math.floor(Math.random() * categories.length)],
      tags: ["tag1", "tag2"],
      saved: false,
      description: "Beautiful image",
      uploadDate: new Date().toISOString(),
    }))
  );
  const [newImage, setNewImage] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // newest, popular, oldest
  const [showFilters, setShowFilters] = useState(false);
  const [expandedImage, setExpandedImage] = useState(null);
  const [newImageDescription, setNewImageDescription] = useState("");
  const [newImageTags, setNewImageTags] = useState("");
  const [newImageCategory, setNewImageCategory] = useState(categories[0]);
  const [viewMode, setViewMode] = useState("grid"); // grid, compact, large
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false); // New state to control form visibility
  const inputRef = useRef(null);

  // Focus input when form appears
  useEffect(() => {
    if (showAddForm) {
      inputRef.current?.focus();
    }
  }, [showAddForm]);

  // Add an Image Manually
  const addImage = () => {
    if (newImage.trim()) {
      const tagsArray = newImageTags.split(",").map(tag => tag.trim()).filter(tag => tag);
      
      setImages([
        { 
          src: newImage, 
          likes: 0, 
          favorite: false,
          category: newImageCategory,
          tags: tagsArray,
          saved: false,
          description: newImageDescription,
          uploadDate: new Date().toISOString(),
        }, 
        ...images
      ]);
      setNewImage("");
      setNewImageDescription("");
      setNewImageTags("");
      setNewImageCategory(categories[0]);
      // Keep the form open for adding more images
    }
  };

  // Reset and close form
  const closeAddForm = () => {
    setNewImage("");
    setNewImageDescription("");
    setNewImageTags("");
    setNewImageCategory(categories[0]);
    setShowAddForm(false);
  };

  // Like an Image
  const likeImage = (index) => {
    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, likes: img.likes + 1 } : img
      )
    );
  };

  // Toggle Favorite
  const toggleFavorite = (index) => {
    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, favorite: !img.favorite } : img
      )
    );
  };

  // Toggle Save/Bookmark
  const toggleSave = (index) => {
    setImages((prev) =>
      prev.map((img, i) =>
        i === index ? { ...img, saved: !img.saved } : img
      )
    );
  };

  // Delete an Image
  const deleteImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // Share Image (mock functionality)
  const shareImage = (image) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this image',
        text: image.description || 'Beautiful image from Pinterest Clone',
        url: image.src,
      }).catch(err => {
        alert('Sharing failed: ' + err);
      });
    } else {
      // Fallback
      alert(`Share link copied: ${image.src}`);
      navigator.clipboard.writeText(image.src);
    }
  };

  // Download Image
  const downloadImage = async (image) => {
    try {
      const response = await fetch(image.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pinterest-clone-image-${Date.now()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to download image');
    }
  };

  // Shuffle Images
  const shuffleImages = () => {
    setImages(prevImages => {
      const newImages = [...prevImages];
      for (let i = newImages.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newImages[i], newImages[j]] = [newImages[j], newImages[i]];
      }
      return newImages;
    });
  };

  // Infinite Scrolling: Load More Images
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200
      ) {
        setImages((prev) => [
          ...prev,
          ...Array.from({ length: 8 }, () => ({
            src: generateRandomImage(),
            likes: Math.floor(Math.random() * 100),
            favorite: false,
            category: categories[Math.floor(Math.random() * categories.length)],
            tags: ["tag1", "tag2"],
            saved: false,
            description: "Beautiful image",
            uploadDate: new Date().toISOString(),
          })),
        ]);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter and sort images
  const filteredImages = images
    .filter(image => {
      // Filter by search term
      const matchesSearch = searchTerm === "" || 
        image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by category
      const matchesCategory = selectedCategory === "" || image.category === selectedCategory;
      
      // Filter by bookmarks if showBookmarks is true
      const matchesBookmarks = !showBookmarks || image.saved;
      
      return matchesSearch && matchesCategory && matchesBookmarks;
    })
    .sort((a, b) => {
      // Sort by selected criteria
      if (sortBy === "newest") {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      } else if (sortBy === "oldest") {
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      } else if (sortBy === "popular") {
        return b.likes - a.likes;
      }
      return 0;
    });

  // Group images into rows (based on view mode)
  const imagesPerRow = viewMode === "large" ? 2 : viewMode === "compact" ? 6 : 4;
  
  const rows = [];
  for (let i = 0; i < filteredImages.length; i += imagesPerRow) {
    rows.push(filteredImages.slice(i, i + imagesPerRow));
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        minHeight: "100vh",
        backgroundColor: darkMode ? "#121212" : "#f8f8f8",
        color: darkMode ? "white" : "black",
        padding: "20px",
        transition: "0.5s ease-in-out",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          maxWidth: "1200px",
          margin: "0 auto",
          paddingBottom: "20px",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>🖼 Pinterest Clone</h1>

        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          {/* Add Image Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddForm(!showAddForm)}
            style={{
              backgroundColor: showAddForm ? "#28a745" : "#007bff",
              color: "white",
              padding: "8px 15px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
              fontWeight: "bold",
            }}
          >
            <FaPlus /> {showAddForm ? "Hide Form" : "Add Image"}
          </motion.button>

          {/* View Mode Selector */}
          <select 
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value)}
            style={{
              padding: "5px 10px",
              borderRadius: "5px",
              backgroundColor: darkMode ? "#333" : "white",
              color: darkMode ? "white" : "black",
              border: "1px solid #ccc",
            }}
          >
            <option value="grid">Grid View</option>
            <option value="compact">Compact View</option>
            <option value="large">Large View</option>
          </select>

          {/* Shuffle Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={shuffleImages}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: darkMode ? "#FFD700" : "#333",
            }}
            title="Shuffle Images"
          >
            <FaRandom />
          </motion.button>

          {/* Bookmarks Toggle */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowBookmarks(!showBookmarks)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "20px",
              color: showBookmarks ? "#ff4500" : darkMode ? "#FFD700" : "#333",
            }}
            title={showBookmarks ? "Show All Images" : "Show Bookmarks Only"}
          >
            <FaBookmark />
          </motion.button>

          {/* Dark Mode Toggle */}
          <motion.button
            whileTap={{ rotate: 360, scale: 1.2 }}
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "24px",
              color: darkMode ? "#FFD700" : "#333",
            }}
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </motion.button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto 20px", 
        display: "flex", 
        flexDirection: "column", 
        gap: "10px" 
      }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            flex: 1,
            backgroundColor: darkMode ? "#333" : "white",
            borderRadius: "5px",
            padding: "0 10px",
            border: "1px solid #ccc",
          }}>
            <FaSearch style={{ color: darkMode ? "#aaa" : "#777" }} />
            <input
              type="text"
              placeholder="Search images by description or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                padding: "10px",
                border: "none",
                backgroundColor: "transparent",
                color: darkMode ? "white" : "black",
                outline: "none",
              }}
            />
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowFilters(!showFilters)}
            style={{
              backgroundColor: showFilters ? "#007bff" : darkMode ? "#333" : "#eee",
              color: showFilters ? "white" : darkMode ? "white" : "black",
              padding: "10px 15px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FaFilter />
            Filters
          </motion.button>
        </div>

        {/* Expanded Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                overflow: "hidden",
                backgroundColor: darkMode ? "#333" : "white",
                borderRadius: "5px",
                padding: "15px",
                display: "flex",
                flexWrap: "wrap",
                gap: "15px",
                alignItems: "center",
              }}
            >
              <div>
                <label style={{ marginRight: "10px" }}>Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: "8px",
                    borderRadius: "5px",
                    backgroundColor: darkMode ? "#444" : "white",
                    color: darkMode ? "white" : "black",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                </div>

<div>
  <label style={{ marginRight: "10px" }}>Sort By:</label>
  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    style={{
      padding: "8px",
      borderRadius: "5px",
      backgroundColor: darkMode ? "#444" : "white",
      color: darkMode ? "white" : "black",
      border: "1px solid #ccc",
    }}
  >
    <option value="newest">Newest First</option>
    <option value="oldest">Oldest First</option>
    <option value="popular">Most Popular</option>
  </select>
</div>

<button
  onClick={() => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("newest");
    setShowBookmarks(false);
  }}
  style={{
    backgroundColor: darkMode ? "#555" : "#eee",
    color: darkMode ? "white" : "black",
    padding: "8px 15px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
  }}
>
  Reset Filters
</button>
</motion.div>
)}
</AnimatePresence>
</div>

{/* Collapsible Add Image Form */}
<AnimatePresence>
{showAddForm && (
<motion.div 
initial={{ height: 0, opacity: 0 }}
animate={{ height: "auto", opacity: 1 }}
exit={{ height: 0, opacity: 0 }}
transition={{ duration: 0.3 }}
style={{ 
maxWidth: "1200px", 
margin: "0 auto 20px", 
overflow: "hidden",
}}
>
<div style={{ 
padding: "15px", 
backgroundColor: darkMode ? "#333" : "white",
borderRadius: "8px",
boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
}}>
<h3 style={{ marginBottom: "10px" }}>Add New Image</h3>
<div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
  <input
    ref={inputRef}
    type="text"
    placeholder="Enter image URL"
    value={newImage}
    onChange={(e) => setNewImage(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      backgroundColor: darkMode ? "#444" : "white",
      color: darkMode ? "white" : "black",
    }}
  />  
  <textarea
    placeholder="Image description"
    value={newImageDescription}
    onChange={(e) => setNewImageDescription(e.target.value)}
    style={{
      padding: "10px",
      borderRadius: "5px",
      border: "1px solid #ccc",
      backgroundColor: darkMode ? "#444" : "white",
      color: darkMode ? "white" : "black",
      minHeight: "60px",
      resize: "vertical"
    }}
  />
  
  <div style={{ display: "flex", gap: "10px" }}>
    <input
      type="text"
      placeholder="Tags (comma separated)"
      value={newImageTags}
      onChange={(e) => setNewImageTags(e.target.value)}
      style={{
        flex: 1,
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        backgroundColor: darkMode ? "#444" : "white",
        color: darkMode ? "white" : "black",
      }}
    />
    
    <select
      value={newImageCategory}
      onChange={(e) => setNewImageCategory(e.target.value)}
      style={{
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc",
        backgroundColor: darkMode ? "#444" : "white",
        color: darkMode ? "white" : "black",
      }}
    >
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  </div>
  
  <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
    <button
      onClick={closeAddForm}
      style={{
        backgroundColor: darkMode ? "#555" : "#eee",
        color: darkMode ? "white" : "black",
        padding: "10px 15px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
      }}
    >
      Cancel
    </button>
    
    <button
      onClick={addImage}
      style={{
        backgroundColor: "#007bff",
        color: "white",
        padding: "10px 15px",
        borderRadius: "5px",
        border: "none",
        cursor: "pointer",
        fontWeight: "bold",
      }}
    >
      Add Image
    </button>
  </div>
</div>
</div>
</motion.div>
)}
</AnimatePresence>

{/* Results Count */}
<div style={{ 
maxWidth: "1200px", 
margin: "0 auto 15px",
fontSize: "14px",
color: darkMode ? "#aaa" : "#666" 
}}>
Showing {filteredImages.length} {filteredImages.length === 1 ? 'image' : 'images'}
{showBookmarks ? ' (bookmarked)' : ''}
{selectedCategory ? ` in ${selectedCategory}` : ''}
{searchTerm ? ` matching "${searchTerm}"` : ''}
</div>

{/* Grid Layout with Rows and Columns */}
<div style={{ maxWidth: "1200px", margin: "0 auto" }}>
{filteredImages.length === 0 ? (
<div style={{ 
textAlign: "center", 
padding: "50px", 
backgroundColor: darkMode ? "#333" : "white",
borderRadius: "8px",
marginTop: "20px"
}}>
<h3>No images found</h3>
<p>Try adjusting your filters or adding new images.</p>
</div>
) : (
rows.map((row, rowIndex) => (
<div 
key={rowIndex} 
style={{ 
  display: "flex", 
  justifyContent: "space-between", 
  marginBottom: "20px",
  gap: "15px"
}}
>
{row.map((image, colIndex) => {
  const index = rowIndex * imagesPerRow + colIndex;
  return (
    <motion.div
      key={index}
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 150 }}
      style={{
        position: "relative",
        borderRadius: "10px",
        overflow: "hidden",
        backgroundColor: darkMode ? "#333" : "white",
        boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
        flex: "1 0 0",
        padding: "10px",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={image.src}
          alt={image.description}
          style={{
            width: "100%",
            height: viewMode === "large" ? "300px" : viewMode === "compact" ? "150px" : "200px",
            borderRadius: "10px",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() => setExpandedImage(image)}
        />
        
        {/* Category Badge */}
        <div style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "3px 8px",
          borderRadius: "12px",
          fontSize: "12px",
        }}>
          {image.category}
        </div>
        
        {/* Quick Action Buttons */}
        <div style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
        }}>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => toggleSave(index)}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: image.saved ? "#ff4500" : "rgba(255,255,255,0.8)",
              color: image.saved ? "white" : "#333",
              border: "none",
              cursor: "pointer",
            }}
            title={image.saved ? "Remove from bookmarks" : "Save to bookmarks"}
          >
            <FaBookmark size={14} />
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={() => setExpandedImage(image)}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(255,255,255,0.8)",
              color: "#333",
              border: "none",
              cursor: "pointer",
            }}
            title="Expand image"
          >
            <FaExpand size={14} />
          </motion.button>
        </div>
      </div>

      {/* Image Info */}
      <div style={{ marginTop: "10px" }}>
        {viewMode !== "compact" && (
          <p style={{ 
            fontSize: "14px", 
            marginBottom: "8px",
            color: darkMode ? "#ddd" : "#333"
          }}>
            {image.description}
          </p>
        )}
        
        {/* Tags */}
        {viewMode !== "compact" && image.tags.length > 0 && (
          <div style={{ 
            display: "flex", 
            flexWrap: "wrap", 
            gap: "5px",
            marginBottom: "8px" 
          }}>
            <FaTags size={12} style={{ color: darkMode ? "#aaa" : "#777", marginRight: "5px" }} />
            {image.tags.map((tag, i) => (
              <span 
                key={i}
                style={{
                  fontSize: "12px",
                  backgroundColor: darkMode ? "#444" : "#eee",
                  color: darkMode ? "#ddd" : "#666",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Image Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "5px",
          }}
        >
          {/* Like Button */}
          <motion.button
            onClick={() => likeImage(index)}
            whileTap={{ scale: 0.8 }}
            style={{
              color: "#007bff",
              fontSize: "14px",
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FaHeart />
            {image.likes}
          </motion.button>

          {/* Favorite Button */}
          <motion.button
            onClick={() => toggleFavorite(index)}
            animate={{ scale: image.favorite ? 1.3 : 1 }}
            transition={{ duration: 0.3 }}
            style={{
              color: image.favorite ? "gold" : "#ccc",
              fontSize: "14px",
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FaStar />
          </motion.button>

          {/* Delete Button */}
          <motion.button
            onClick={() => deleteImage(index)}
            whileTap={{ scale: 0.8 }}
            style={{
              color: "red",
              fontSize: "14px",
              border: "none",
              background: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <FaTrash />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
})}

{/* Add empty placeholders if row is not complete */}
{Array(imagesPerRow - row.length).fill().map((_, i) => (
  <div 
    key={`empty-${i}`} 
    style={{ 
      flex: "1 0 0", 
      visibility: "hidden" 
    }}
  />
))}
</div>
))
)}
</div>

{/* Expanded Image Modal */}
<AnimatePresence>
{expandedImage && (
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}
style={{
position: "fixed",
top: 0,
left: 0,
right: 0,
bottom: 0,
backgroundColor: "rgba(0,0,0,0.85)",
display: "flex",
flexDirection: "column",
justifyContent: "center",
alignItems: "center",
zIndex: 1000,
padding: "20px",
overflowY: "auto", // Enable scrolling for the entire modal
}}
onClick={() => setExpandedImage(null)}
>
<motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "90%",
                maxWidth: "900px", // Limit maximum width
                backgroundColor: darkMode ? "#333" : "white",
                borderRadius: "10px",
                overflow: "hidden",
                boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
                maxHeight: "90vh", // Limit maximum height
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ 
                position: "relative",
                backgroundColor: "#000",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                maxHeight: "60vh",
              }}>
                <img
                  src={expandedImage.src}
                  alt={expandedImage.description}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "60vh",
                    objectFit: "contain",
                  }}
                />
                
                {/* Close button in top-right corner */}
                <button
                  onClick={() => setExpandedImage(null)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  ✕
                </button>
              </div>
              
              <div style={{ 
                padding: "20px",
                overflowY: "auto", // Enable scrolling for content if needed
                flex: "1",
              }}>
                <h3 style={{ marginBottom: "10px" }}>{expandedImage.description}</h3>
                
                <div style={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: "5px",
                  marginBottom: "15px" 
                }}>
                  {expandedImage.tags && expandedImage.tags.length > 0 ? (
                    expandedImage.tags.map((tag, i) => (
                      <span 
                        key={i}
                        style={{
                          fontSize: "12px",
                          backgroundColor: darkMode ? "#444" : "#eee",
                          color: darkMode ? "#ddd" : "#666",
                          padding: "3px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: "12px", color: darkMode ? "#aaa" : "#999" }}>
                      No tags
                    </span>
                  )}
                </div>
                
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column",
                  gap: "15px",
                  borderTop: "1px solid " + (darkMode ? "#444" : "#ddd"),
                  paddingTop: "15px",
                }}>
                  <div>
                    <div style={{ 
                      marginBottom: "10px",
                      color: darkMode ? "#aaa" : "#666",
                      fontSize: "14px",
                    }}>
                      Category: {expandedImage.category}
                    </div>
                    <div style={{ 
                      color: darkMode ? "#aaa" : "#666",
                      fontSize: "14px",
                    }}>
                      Likes: {expandedImage.likes}
                    </div>
                  </div>
                  
                  <div style={{ 
                    display: "flex", 
                    flexWrap: "wrap",
                    gap: "10px",
                    marginTop: "5px",
                  }}>
                    <button
                      onClick={() => shareImage(expandedImage)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "8px 12px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      <FaShareAlt /> Share
                    </button>
                    
                    <button
                      onClick={() => downloadImage(expandedImage)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "8px 12px",
                        backgroundColor: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      <FaDownload /> Download
                    </button>
                    
                    <button
                      onClick={() => setExpandedImage(null)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: darkMode ? "#555" : "#eee",
                        color: darkMode ? "white" : "black",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      </AnimatePresence>
    </motion.div>
  );
};

export default PinterestClone;
