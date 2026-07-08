import { SignIn } from "@clerk/nextjs";
import React from "react";

const Login = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <SignIn />
    </div>
  );
};

export default Login;
