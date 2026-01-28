// Tooltip.js
import React from "react";
import "../App.css";

const Tooltip = ({ visible, x, y, content }) => {
  if (!visible) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: x +20, // 避开鼠标指针
        top: y +20,
        background: "rgba(0,0,0,0.75)",
        color: "#fff",
        padding: "5px 8px",
        borderRadius: "4px",
        fontSize: "14px",
        pointerEvents: "none",
        whiteSpace: "pre-line",
       
      }}
    >
      {content}
    </div>
  );
};

export default Tooltip;
