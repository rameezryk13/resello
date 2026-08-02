import { useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import "./Toast.css";

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const Toast = ({ id, type = "info", message, duration = 4000, onClose }) => {
  const Icon = ICONS[type] || Info;

  useEffect(() => {
    if (!duration) return;

    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div className={`toast toast--${type}`} role="alert">
      <Icon className="toast__icon" size={20} />
      <p className="toast__message">{message}</p>
      <button
        type="button"
        onClick={() => onClose(id)}
        className="toast__close"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default Toast;
