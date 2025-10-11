import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Conversational Kiosk for jewellery shopping",
  description:
    "Buy jewellery from Evol jewels using the conversational kiosk powered by AI.",
};

// eslint-disable-next-line react/prop-types
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "linear-gradient(135deg, #D4AF37 0%, #F4E4B5 100%)",
              color: "#2C2C2C",
              border: "1px solid #D4AF37",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
            },
            className: "my-toast",
          }}
        />
      </body>
    </html>
  );
}
