import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const logoutUser = () => {
      localStorage.clear();
      toast.success("Logout successful");
      navigate("/login");
      window.location.reload();    
    };

    logoutUser();
  }, [navigate]);

  

  return null;
};

export default Logout;
