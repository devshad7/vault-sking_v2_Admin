import { SignUp } from "@clerk/nextjs";
import React from "react";

const Signup = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <SignUp />
    </div>
  );
};

export default Signup;
