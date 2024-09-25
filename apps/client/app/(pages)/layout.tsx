import '../globals.css';
import { Toaster } from 'react-hot-toast';
export const metadata = {
  title: 'expo',
  description: 'Exponential',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      style={{
        padding: 0,
        margin: 0,
      }}
    >
      <body
        style={{
          padding: 0,
          margin: 0,
        }}
      >
        <Toaster />
        {children}
      </body>
    </html>
  );
}
