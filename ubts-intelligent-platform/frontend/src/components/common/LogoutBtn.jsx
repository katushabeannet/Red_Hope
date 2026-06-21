import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function LogoutBtn() {
  const { logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    showToast({ type: "info", title: "Logged Out", message: "You have successfully signed out." });
    navigate("/");
  };

  return (
    <button className="rh-logout-btn" onClick={handleLogout} title="Sign out">
      <span className="lb-sign">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path fill="#fff" d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
        </svg>
      </span>
      <span className="lb-text">Logout</span>
    </button>
  );
}

export default LogoutBtn;
