import { Footer } from "@/components/footer";
import { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-col flex-1 min-h-screen">
      {children}
      <Footer />
    </main>
  );
}

export default Layout;
