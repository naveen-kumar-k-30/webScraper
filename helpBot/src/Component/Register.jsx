import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEffect } from 'react';
import backEndUrls from "../utils/urls";// import { backendURL } from "../utils/urls";
const Register = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // You can customize the animation duration
    });
  }, []);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const router = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" })); // Clear individual field errors
  };
  

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username) newErrors.username = "Name is required";
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
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
        const response = await axios.post(`${backEndUrls}/signup`, formData);
        if (response.data.token) {
          localStorage.setItem("token", response.data.token); // Store token
          localStorage.setItem('userEmail', formData.email); 
          toast.success("Registered and Logged In Successfully");
          router("/", { replace: true });         
          window.location.reload();
          setFormData({ username: "", email: "", password: "" });
          setErrors({});
        }
      } catch (error) {
        console.error("Error during sign up:", error);
        setErrors({
          general:
            error.response?.data?.error || "Sign up failed. Please try again later.",
        });
      }
    }
  };
  

  return (
    <div className="w-[90%] mx-auto max-w-md mt-10 bg-white p-6 rounded-lg shadow-lg" data-aos="flip-right">
      <h2 className="text-2xl font-semibold text-center mb-4">Sign Up</h2>
      <div className="grid grid-cols-2 gap-4">
        <img
          src="https://ik.imagekit.io/a2gpaui9b/cake%20shop/Screenshot%202024-10-06%20162143.png?updatedAt=1728212092849"
          alt="master img"
          className="sm:order-2 md:order-2 lg:order-2 sm:h-72 md:h-80 lg:h-80 rounded-lg"
          data-aos="fade-left"
        />
        <form onSubmit={handleSubmit} className="space-y-4" data-aos="fade-right">
          <div>
            <label className="block text-gray-700">Name</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Enter your name"
            />
            {errors.username && <p className="text-red-500">{errors.username}</p>}
          </div>
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
            {errors.password && (
              <p className="text-red-500">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-[#DE8816] to-orange-600 text-white font-bold py-3 px-4 rounded-lg hover:from-orange-400 hover:to-orange-700 transition duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
            Sign Up
          </button>

          <h1 className="text-sm text-muted-foreground text-center">
            Already a user ?{" "}
            <span
              onClick={() => router("/login")}
              className="cursor-pointer text-[#DE8816] underline"
            >
              Login
            </span>
          </h1>
        </form>
      </div>
    </div>
  );
};

export default Register;
