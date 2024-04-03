import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Toronto Sandsharks Beach Volleyball Club",
  description: "LGBTQ+ beach volleyball in Toronto",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='bg-orange-200 mt-0 mr-12 ml-12 mb-10'>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
