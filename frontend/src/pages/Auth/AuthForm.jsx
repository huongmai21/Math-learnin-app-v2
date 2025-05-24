"use client";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, register, clearError } from "../../redux/slices/authSlice";
import { toast } from "react-toastify";
import "./LogReg.css";

const AuthForm = () => {
  const dispatch = useDispatch();
  const { user, error, loading, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });
  const [errors, setErrors] = useState({});
  const [isLogin, setIsLogin] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/users/profile");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const pathname = location.pathname;
    setIsLogin(pathname === "/auth/login");
    dispatch(clearError());
    setErrors({});
  }, [location.pathname, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!isLogin) {
      if (!formData.username || formData.username.length < 3) {
        newErrors.username = "Tên người dùng phải có ít nhất 3 ký tự";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }

      if (!formData.role) {
        newErrors.role = "Vui lòng chọn vai trò";
      }
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password || formData.password.length < 8) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    if (errors[name]) {
      setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await dispatch(
          login({
            email: formData.email,
            password: formData.password,
          })
        ).unwrap();
      } else {
        await dispatch(
          register({
            username: formData.username,
            email: formData.email,
            password: formData.password,
            role: formData.role,
          })
        ).unwrap();
      }
      navigate("/users/profile");
    } catch (error) {
      console.error("Lỗi xử lý form:", error);
      if (error.errors) {
        setErrors(error.errors);
      } else {
        toast.error(error.message || "Đã xảy ra lỗi. Vui lòng thử lại.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="background"></div>
      <div className="container">
        <div className="content">
          <h2 className="logo">
            <i className="fa-solid fa-bahai"></i> FunMath
          </h2>
          <div className="text-sci">
            <h2>
              <p>Welcome!</p>
              <br />
              <span>
                FunMath đang chờ bạn <br />
                khám phá đấy!
              </span>
            </h2>
            <p>
              Cùng khám phá niềm vui và đam mê <br />
              trong thế giới Toán học nào!
            </p>
            <div className="social-icons">
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-linkedin"></i>
              </a>
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-facebook-square"></i>
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-instagram"></i>
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fab fa-twitter"></i>
              </a>
            </div>
          </div>
        </div>
        <div className={`logreg-box ${isLogin ? "" : "active"}`}>
          <div className={`form-box login ${isLogin ? "active" : ""}`}>
            <form onSubmit={handleSubmit}>
              <h2>Đăng nhập</h2>
              {error && <p className="error">{error}</p>}
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading || isLoading}
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </div>
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading || isLoading}
                />
                {errors.password && <p className="error">{errors.password}</p>}
              </div>
              <div className="remember-forgot">
                <label>
                  <input type="checkbox" disabled={loading || isLoading} /> Ghi
                  nhớ đăng nhập
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  disabled={loading || isLoading}
                >
                  Quên mật khẩu?
                </button>
              </div>
              <button
                type="submit"
                className="btn"
                disabled={loading || isLoading}
              >
                {loading || isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
              </button>
              <div className="login-register">
                <p>
                  Chưa có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/auth/register")}
                    disabled={loading || isLoading}
                  >
                    Đăng ký
                  </button>
                </p>
              </div>
            </form>
          </div>
          <div className={`form-box register ${!isLogin ? "active" : ""}`}>
            <form onSubmit={handleSubmit}>
              <h2>Đăng ký</h2>
              {error && <p className="error">{error}</p>}
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-user"></i>
                </span>
                <input
                  type="text"
                  name="username"
                  placeholder="Tên người dùng"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={loading || isLoading}
                />
                {errors.username && <p className="error">{errors.username}</p>}
              </div>
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-envelope"></i>
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading || isLoading}
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </div>
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  disabled={loading || isLoading}
                />
                {errors.password && <p className="error">{errors.password}</p>}
              </div>
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-lock"></i>
                </span>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  disabled={loading || isLoading}
                />
                {errors.confirmPassword && (
                  <p className="error">{errors.confirmPassword}</p>
                )}
              </div>
              <div className="input-box">
                <span className="icon">
                  <i className="fas fa-user-circle"></i>
                </span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  disabled={loading || isLoading}
                  className="role-select"
                >
                  <option value="student">Học sinh</option>
                  <option value="teacher">Giáo viên</option>
                </select>
                {errors.role && <p className="error">{errors.role}</p>}
              </div>
              <div className="remember-forgot">
                <label>
                  <input
                    type="checkbox"
                    required
                    disabled={loading || isLoading}
                  />{" "}
                  Tôi đồng ý với các điều khoản và điều kiện
                </label>
              </div>
              <button
                type="submit"
                className="btn"
                disabled={loading || isLoading}
              >
                {loading || isLoading ? "Đang đăng ký..." : "Đăng ký"}
              </button>
              <div className="login-register">
                <p>
                  Đã có tài khoản?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/auth/login")}
                    disabled={loading || isLoading}
                  >
                    Đăng nhập
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
