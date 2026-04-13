import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata = {
  title: "CloudGuard",
  description: "Cloud Security Copilot",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${jetBrainsMono.variable} scroll-smooth`}
    >
      <body className="min-h-screen w-full bg-slate-50 overflow-x-hidden antialiased p-0 m-0 text-slate-800">
        {children}
      </body>
    </html>
  );
}
