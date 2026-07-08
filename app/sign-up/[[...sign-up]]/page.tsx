import Signup from "@/components/auth/Signup";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Signup | Vault Skin",
  description:
    "Sign up to Vault Skin which is a skin care product distributor in all over nepal.",
};

function Page() {
  return (
    <>
      <Signup />
    </>
  );
}

export default Page;
