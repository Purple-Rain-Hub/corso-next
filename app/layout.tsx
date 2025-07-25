import type { Metadata } from "next";
import { AuthProvider } from '@/lib/auth/context'
import { CartProvider } from '@/lib/context/CartContext'
import { ToastProvider } from './components/ui/ToastProvider'
import Navbar from './components/Navbar'
import "./globals.css";

export const metadata: Metadata = {
  title: "PetShop - Il tuo negozio di animali online",
  description: "Trova tutto quello che serve per i tuoi amici a quattro zampe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Navbar />
              {children}
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
