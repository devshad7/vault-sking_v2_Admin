import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <Link href="/admin/dashboard">
        <Button variant="default" className="cursor-pointer">
          Vault Skin Admin
        </Button>
      </Link>
    </div>
  );
}
