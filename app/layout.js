import "./globals.css";

export const metadata = {
  title: "Dokumentasi Kegiatan DPRD Kota Bandung",
  description: "Sistem informasi dokumentasi kegiatan DPRD Kota Bandung",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
