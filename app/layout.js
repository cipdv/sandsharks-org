import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Toronto Sandsharks Beach Volleyball Club",
  description: "LGBTQ+ beach volleyball in Toronto",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className='bg-orange-200 m-6'>
        
        {children}
      </body>
    </html>
  );
}
