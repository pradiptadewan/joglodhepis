import type { Metadata } from "next";
import { Playfair_Display, Lato } from "next/font/google";
import "./main.css";
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from "react-hot-toast";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

const lato = Lato({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Joglo Dhepis",
  description: "Experience the ultimate luxury.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${lato.variable} font-sans bg-[#FAF9F6] text-[#2D2D2D] antialiased`}>
        <AuthProvider>
          <Toaster position="top-center" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}