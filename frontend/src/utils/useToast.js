
import { toast } from "react-toastify";

const useToast = () => {
  const showToast = (type, message, options = {}) => {
    const toastOptions = {
      toastId: options.id || message,
      autoClose: 3000,
      ...options,
    };
    switch (type) {
      case "success":
        toast.success(message, toastOptions);
        break;
      case "error":
        toast.error(message, toastOptions);
        break;
      case "info":
        toast.info(message, toastOptions);
        break;
      default:
        toast(message, toastOptions);
    }
  };

  return { showToast };
};

export default useToast;