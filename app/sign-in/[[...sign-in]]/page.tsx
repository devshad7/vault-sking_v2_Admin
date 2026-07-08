import Login from "@/components/auth/Login";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Login | Vault Skin",
  description:
    "Login to Vault Skin which is a skin care product distributor in all over nepal.",
};

function Page() {
  return (
    <>
      <Login />
    </>
  );
}

export default Page;
