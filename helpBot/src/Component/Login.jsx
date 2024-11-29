import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import backEndUrls from "../utils/urls";// import { backendURL } from "../utils/urls";
const Login = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // You can customize the animation duration
    });
  }, []);
  const router = useNavigate()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  // const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
  
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      try {
        
        const response = await axios.post(`${backEndUrls}/login`, formData);
        console.log(response.data); // Log the response to check its structure
        if (response.data.token) {
          localStorage.setItem('token', response.data.token); 
          localStorage.setItem('userEmail', formData.email); 
          toast.success("Login successful");
          router("/", { replace: true });          
          window.location.reload();
          setFormData({ email: "", password: "" });
          setErrors({});
        }
      } catch (error) {
        console.error("Error during login:", error); // Log the entire error object
        toast.error("Invalid Email or Password");
        if (error.response && error.response.data && error.response.data.error) {
          setErrors({ general: error.response.data.error });
        } else {
          setErrors({ general: "Login failed. Please try again later." });
        }
      }
    }
  };
  
  return (
    <div className="w-[90%] mx-auto max-w-md mt-10 bg-white p-6 rounded-lg shadow-lg" data-aos="flip-left">
      <h2 className="text-2xl font-semibold text-center mb-4">Login</h2>
      <div className="grid grid-cols-2 gap-4">
        <img
          src="https://ik.imagekit.io/a2gpaui9b/cake%20shop/Screenshot%202024-10-06%20162055.png?updatedAt=1728212092757"
          alt="master img"
          className="sm:order-2 md:order-2 lg:order-2 sm:h-72 md:h-80 lg:h-80 rounded-lg "
          data-aos="fade-left"
        />
      <form onSubmit={handleSubmit} className="space-y-4" data-aos="fade-right">

        <div>
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter your email"
          />
          {errors.email && <p className="text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-gray-700">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Enter your password"
          />
          {errors.password && <p className="text-red-500">{errors.password}</p>}
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#DE8816] to-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:from-orange-400 hover:to-orange-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
          Login
        </button>
        <h1 className="text-sm text-muted-foreground text-center">New user ? <span onClick={()=>router("/signup")} className="cursor-pointer text-[#DE8816] underline">Register</span></h1>
      </form>
      </div>
    </div>
  );
};

export default Login;
