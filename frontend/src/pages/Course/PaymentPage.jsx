"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet";
import { getCourse, enrollCourse } from "../../services/courseService";
import "./PaymentPage.css";

const PaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    cardHolder: "",
  });
  const [confirmPayment, setConfirmPayment] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      toast.error("Vui lòng đăng nhập để thanh toán!");
      navigate("/auth/login");
      return;
    }

    const fetchCourse = async () => {
      setLoading(true);
      try {
        const courseResponse = await getCourse(id);
        setCourse(courseResponse.data);
      } catch (err) {
        setError(err?.message || "Không thể tải thông tin khóa học!");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user, token, navigate]);

  const handleImageError = (e) => {
    e.target.src =
      "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png";
  };

  const handleEnrollFree = async () => {
    if (course.price === 0) {
      try {
        setProcessingPayment(true);
        await enrollCourse(course._id);
        toast.success("Đăng ký khóa học thành công!");
        navigate(`/courses/${course._id}`);
      } catch (err) {
        toast.error(err?.message || "Đăng ký khóa học thất bại!");
      } finally {
        setProcessingPayment(false);
      }
    }
  };

  const handleMockPayment = async () => {
    try {
      setProcessingPayment(true);
      // Giả lập thanh toán
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await enrollCourse(course._id);
      toast.success("Thanh toán thành công! Bạn đã đăng ký khóa học!");
      navigate(`/courses/${course._id}`);
    } catch (err) {
      toast.error(err?.message || "Thanh toán thất bại!");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">Đang tải thông tin khóa học...</div>
    );
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  if (!course) {
    return <div className="no-results">Khóa học không tồn tại.</div>;
  }

  return (
    <div className="payment-page">
      <Helmet>
        <title>FunMath - Thanh toán khóa học</title>
        <meta
          name="description"
          content={`Thanh toán cho khóa học ${course.title}.`}
        />
      </Helmet>
      <div className="payment-container">
        <Link to={`/courses/${id}`} className="back-link">
          <i className="fas fa-arrow-left"></i> Quay lại khóa học
        </Link>
        <h2>Thanh toán khóa học</h2>
        <div className="course-info">
          <img
            src={
              course.thumbnail ||
              "https://res.cloudinary.com/duyqt3bpy/image/upload/v1746934625/2_yjbcfb.png"
            }
            alt={course.title}
            className="course-thumbnail"
            onError={handleImageError}
          />
          <div className="course-details">
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <p className="course-price">
              Giá: {course.price.toLocaleString()} VND
            </p>
            <p className="course-instructor">
              Giảng viên: {course.instructorId?.username || "N/A"}
            </p>
          </div>
        </div>
        <div className="payment-form-section">
          <h3>Thông tin thanh toán</h3>

          {course.price === 0 ? (
            <button
              onClick={handleEnrollFree}
              className="enroll-free-button"
              disabled={processingPayment}
            >
              {processingPayment ? "Đang xử lý..." : "Đăng ký miễn phí"}
            </button>
          ) : (
            <div className="payment-options">
              <div className="payment-method">
                <h4>Phương thức thanh toán</h4>
                <div className="payment-methods-list">
                  <label className="payment-method-item">
                    <input
                      type="radio"
                      name="payment-method"
                      value="credit-card"
                      checked={paymentMethod === "credit-card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-icon">
                      <i className="fas fa-credit-card"></i>
                    </span>
                    <span className="method-name">Thẻ tín dụng/ghi nợ</span>
                  </label>
                  <label className="payment-method-item">
                    <input
                      type="radio"
                      name="payment-method"
                      value="bank-transfer"
                      checked={paymentMethod === "bank-transfer"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-icon">
                      <i className="fas fa-university"></i>
                    </span>
                    <span className="method-name">Chuyển khoản ngân hàng</span>
                  </label>
                  <label className="payment-method-item">
                    <input
                      type="radio"
                      name="payment-method"
                      value="e-wallet"
                      checked={paymentMethod === "e-wallet"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span className="method-icon">
                      <i className="fas fa-wallet"></i>
                    </span>
                    <span className="method-name">Ví điện tử</span>
                  </label>
                </div>
              </div>

              {paymentMethod === "credit-card" && (
                <div className="card-details">
                  <h4>Thông tin thẻ</h4>
                  <div className="form-group">
                    <label>Số thẻ</label>
                    <input
                      type="text"
                      value={cardDetails.cardNumber}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          cardNumber: e.target.value,
                        })
                      }
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Ngày hết hạn</label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            expiry: e.target.value,
                          })
                        }
                        placeholder="MM/YY"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({
                            ...cardDetails,
                            cvv: e.target.value,
                          })
                        }
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Tên chủ thẻ</label>
                    <input
                      type="text"
                      value={cardDetails.cardHolder}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          cardHolder: e.target.value,
                        })
                      }
                      placeholder="NGUYEN VAN A"
                    />
                  </div>
                </div>
              )}

              <div className="payment-summary">
                <h4>Tóm tắt thanh toán</h4>
                <p>Khóa học: {course.title}</p>
                <p>Giá: {course.price.toLocaleString()} VND</p>
                <p>
                  Phương thức:{" "}
                  {paymentMethod === "credit-card"
                    ? "Thẻ tín dụng/ghi nợ"
                    : paymentMethod === "bank-transfer"
                    ? "Chuyển khoản ngân hàng"
                    : "Ví điện tử"}
                </p>
              </div>

              {!confirmPayment ? (
                <button
                  onClick={() => {
                    if (
                      paymentMethod === "credit-card" &&
                      (!cardDetails.cardNumber ||
                        !cardDetails.expiry ||
                        !cardDetails.cvv ||
                        !cardDetails.cardHolder)
                    ) {
                      toast.error("Vui lòng nhập đầy đủ thông tin thẻ!");
                      return;
                    }
                    setConfirmPayment(true);
                  }}
                  className="pay-button"
                  disabled={processingPayment}
                >
                  Xác nhận thanh toán
                </button>
              ) : (
                <>
                  <button
                    onClick={handleMockPayment}
                    className="pay-button"
                    disabled={processingPayment}
                  >
                    {processingPayment
                      ? "Đang xử lý..."
                      : `Thanh toán ${course.price.toLocaleString()} VND`}
                  </button>
                  <button
                    onClick={() => setConfirmPayment(false)}
                    className="cancel-button"
                  >
                    Hủy
                  </button>
                </>
              )}

              <div className="secure-payment">
                <i className="fas fa-lock"></i> Thanh toán an toàn và bảo mật
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
