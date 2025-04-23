import Background from "@/assets/login2.png";
import Victory from "@/assets/victory.svg";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { apiClient } from "@/lib/api-client";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

function Auth() {
  // State variables for handling input fields
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateLogin = () => {
    if (!email.trim().length) {
      toast.error("Email is required.");
      return false;
    }
    if (!password.trim().length) {
      toast.error("Password is required.");
      return false;
    }
    return true;
  };

  const validateSignup = () => {
    if (!email.trim().length) {
      toast.error("Email is required.");
      return false;
    }
    if (!password.trim().length) {
      toast.error("Password is required.");
      return false;
    }
    if (!confirmPassword.trim().length) {
      toast.error("Confirm Password is required.");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password should be the same.");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    try {
      const response = await apiClient.post(
        LOGIN_ROUTE,
        { email, password },
        { withCredentials: true }
      );

      console.log({ response });

      if (response.data.user.id) {
        setUserInfo(response.data.user);
        if (response.data.user.profileSetup) {
          navigate("/chat");
        } else {
          navigate("/profile");
        }
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          toast.error("Email not found. Please sign up first.");
        } else if (error.response.status === 401) {
          toast.error("Incorrect password. Please try again.");
        } else {
          toast.error(error.response.data.message || "Login failed!");
        }
      } else {
        toast.error("No response from the server.");
      }
    }
  };

  const handleSignup = async () => {
    if (!validateSignup()) return;

    try {
      const response = await apiClient.post(
        SIGNUP_ROUTE,
        { email, password },
        { withCredentials: true }
      );

      console.log({ response });

      if (response.status === 201) {
        setUserInfo(response.data.user);
        toast.success("Signup successful!");
        navigate("/profile");
      }
    } catch (error) {
      if (error.response) {
        // Server responded with an error
        const errorMessage = error.response.data.message || "Signup failed!";
        toast.error(errorMessage);
      } else if (error.request) {
        // Request was made but no response was received
        toast.error("No response from the server. Please try again.");
      } else {
        // Something else happened
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    // Main container to center the authentication component
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      {/* Authentication card */}
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w-[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        {/* Left Section - Welcome and Form */}
        <div className="flex flex-col gap-10 items-center justify-center">
          {/* Welcome message with emoji */}
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="victory emoji" className="h-[100px]" />
            </div>
            {/* Subtitle */}
            <p className="font-medium text-center">
              Fill in the details to get started with the best chat app!
            </p>
          </div>

          {/* Tabs Section - Login & Signup */}
          <div className="flex items-center justify-center w-full">
            <Tabs defaultValue="login" className="w-3/4">
              {/* Tabs Navigation - Login & Signup */}
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  value="login"
                  className="bg-white text-black text-opacity-90 border-b-2 rounded-none w-full 
                                    data-[state=active]:text-black data-[state=active]:font-semibold 
                                    data-[state=active]:border-b-purple-500 p-3 transition-all duration-0 
                                    focus:outline-none focus:ring-0 focus-visible:outline-none hover:outline-none"
                >
                  Login
                </TabsTrigger>

                <TabsTrigger
                  value="signup"
                  className="bg-white text-black text-opacity-90 border-b-2 rounded-none w-full 
                                    data-[state=active]:text-black data-[state=active]:font-semibold 
                                    data-[state=active]:border-b-purple-500 p-3 transition-all duration-0 
                                    focus:outline-none focus:ring-0 focus-visible:outline-none hover:outline-none"
                >
                  Signup
                </TabsTrigger>
              </TabsList>

              {/* Login Form */}
              <TabsContent value="login" className="flex flex-col gap-5 mt-10">
                <Input
                  placeholder="Email"
                  type="email"
                  className="bg-white rounded-full p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="bg-white rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  className="rounded-full p-6"
                  onClick={handleLogin}
                  aria-label="Login"
                >
                  Login
                </Button>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup" className="flex flex-col gap-5">
                <Input
                  placeholder="Email"
                  type="email"
                  className="bg-white rounded-full p-6"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  placeholder="Password"
                  type="password"
                  className="bg-white rounded-full p-6"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Input
                  placeholder="Confirm Password"
                  type="password"
                  className="bg-white rounded-full p-6"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  className="rounded-full p-6"
                  onClick={handleSignup}
                  aria-label="Signup"
                >
                  Signup
                </Button>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right Section - Background Image (Only visible on larger screens) */}
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt="background Login" className="h-[570px]" />
        </div>
      </div>
    </div>
  );
}

export default Auth;
