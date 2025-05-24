// frontend/src/pages/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../../services/authService";
import { Helmet } from "react-helmet";
import "./ResetPassword.css";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const socket = io("http://localhost:5000");
    socket.on("connect", () => {
      socket.emit("join", localStorage.getItem("userId")); // Giả sử có userId trong localStorage
    });

    socket.on("passwordResetSuccess", (data) => {
      toast.success(data.message);
    });

    return () => socket.disconnect();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);
    try {
      await resetPassword(token, { password: formData.password });
      toast.success("Đặt lại mật khẩu thành công! Vui lòng đăng nhập.");
      navigate("/auth/login");
    } catch (error) {
      toast.error(error.message || "Đặt lại mật khẩu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="reset-wrapper">
      <Helmet>
        <title>Đặt Lại Mật Khẩu - FunMath</title>
        <meta
          name="description"
          content="Đặt lại mật khẩu tài khoản của bạn trên FunMath để tiếp tục trải nghiệm học toán thú vị."
        />
        <meta
          name="keywords"
          content="đặt lại mật khẩu, FunMath, học toán, giáo dục"
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <div className="container">
        <h2>Đặt Lại Mật Khẩu</h2>
        <p>Nhập mật khẩu mới để tiếp tục.</p>
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu mới"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <div className="input-box">
            <input
              type="password"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn" disabled={loading}>
            {loading ? "Đang xử lý..." : "Đặt Lại Mật Khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
