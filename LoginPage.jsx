// src/components/LoginPage.jsx
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { auth, provider } from "../firebaseConfig";
import { signInWithPopup } from "firebase/auth";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();

  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    const tokenRes = await axios.post("http://localhost:5000/auth", {
      uid: result.user.uid,
      email: result.user.email
    });
    localStorage.setItem("token", tokenRes.data.token);
    navigate("/dashboard");
  };

  return (
    <div className="flex h-screen items-center justify-center relative overflow-hidden">
      <video autoPlay muted loop className="absolute w-full h-full object-cover opacity-20">
        <source src="/ai-bg.mp4" type="video/mp4" />
      </video>

      <motion.div
        className="z-10 bg-aiDark bg-opacity-80 p-10 rounded-2xl shadow-2xl text-center max-w-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-aiGlow mb-6">🎬 AI Drama Dashboard</h1>
        <p className="text-gray-300 mb-6">Login to manage your scenes intelligently</p>
        <button
          onClick={login}
          className="bg-aiBlue hover:bg-aiGlow px-6 py-3 rounded-full text-lg font-semibold shadow-md transition-all duration-300"
        >
          Login with Google
        </button>
      </motion.div>
    </div>
  );
}
