import "./globals.css";

export const metadata = {
  title: "Humas DPRD Kota Bandung",
  description: "Portal informasi dan dokumentasi Humas DPRD Kota Bandung",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
