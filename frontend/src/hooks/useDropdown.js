// frontend/src/hooks/useDropdown.js
import { useState, useRef, useEffect } from "react";

const useDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const toggle = () => {
    console.log("Toggling dropdown, current state:", isOpen); // Debug
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        console.log("Click outside, closing dropdown"); // Debug
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return { isOpen, toggle, ref };
};

export default useDropdown;
