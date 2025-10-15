import { Playfair_Display, Open_Sans, Montserrat } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Conversational Kiosk for jewellery shopping",
  description:
    "Buy jewellery from Evol jewels using the conversational kiosk powered by AI.",
  icons: {
    icon: "/evol.jpg",
  },
};

// eslint-disable-next-line react/prop-types
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/evol.jpg" />
      </head>
      <body
        className={`${playfair.variable} ${openSans.variable} ${montserrat.variable} antialiased`}
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
