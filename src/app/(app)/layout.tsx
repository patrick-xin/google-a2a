import { Footer } from "@/components/footer";
import Header from "@/components/header";
import { ReactNode } from "react";

function Layout({ children }: { children: ReactNode }) {
  return (
    <main className="flex flex-col flex-1 relative">
      <Header />
      <div>{children}</div>

      <Footer />
    </main>
  );
}

export default Layout;
