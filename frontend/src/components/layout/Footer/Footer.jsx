// frontend/src/components/layout/Footer.jsx
import React from "react";
import { motion } from "framer-motion";
import "./Footer.css";

const Footer = () => {
  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <motion.footer
      className="footer"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={sectionVariants}
      aria-label="Website footer"
    >
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} FunMath. All rights reserved.</p>
        <div className="social-links">
          {[
            {
              href: "https://www.linkedin.com",
              icon: "fab fa-linkedin",
              label: "LinkedIn",
            },
            {
              href: "https://www.facebook.com",
              icon: "fab fa-facebook-square",
              label: "Facebook",
            },
            {
              href: "https://www.instagram.com",
              icon: "fab fa-instagram",
              label: "Instagram",
            },
            {
              href: "https://www.twitter.com",
              icon: "fab fa-twitter",
              label: "Twitter",
            },
          ].map(({ href, icon, label }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Follow us on ${label}`}
            >
              <i className={icon}></i>
            </a>
          ))}
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
