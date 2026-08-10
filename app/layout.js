import "./globals.css";

export const metadata = {
  title: "Compute Network",
  description: "Share your idle compute, earn rewards",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}