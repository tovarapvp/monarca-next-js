"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ShoppingCart, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/language-switcher";

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string;
}

export default function Header() {
  const t = useTranslations();
  const [cartCount, setCartCount] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: t('nav.home') },
    { href: "/products", label: t('nav.products') },
    { href: "/about", label: t('nav.about') },
  ];

  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem("monarca-cart");
      if (savedCart) {
        const cartItems: CartItem[] = JSON.parse(savedCart);
        // Count items: per-unit products count as 1, regular products count by quantity
        const count = cartItems.reduce((acc: number, item: any) => {
          return acc + (item.isPerUnit ? 1 : item.quantity);
        }, 0);
        setCartCount(count);
      } else {
        setCartCount(0);
      }
    };

    updateCartCount(); // Initial count

    window.addEventListener("storage", updateCartCount);
    window.addEventListener("cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("cart-updated", updateCartCount);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/monarca-logo.png"
            alt="MONARCA"
            width={40}
            height={40}
            className="h-10 w-auto"
          />
          <span className="text-xl font-serif font-bold text-foreground">
            MONARCA
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? "text-primary" : "text-foreground"
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Button asChild variant="ghost" size="icon" className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">{t('common.cart')}</span>
              {cartCount > 0 && (
                <span className="absolute -top-0 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t('common.openMenu')}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="flex justify-between items-center mb-8">
                <Link
                  href="/"
                  className="flex items-center gap-2"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <Image
                    src="/monarca-logo.png"
                    alt="MONARCA"
                    width={32}
                    height={32}
                  />
                  <span className="text-lg font-serif font-bold">MONARCA</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSheetOpen(false)}
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">{t('common.closeMenu')}</span>
                </Button>
              </div>
              <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-lg font-medium transition-colors hover:text-primary ${pathname === link.href
                      ? "text-primary"
                      : "text-foreground"
                      }`}
                    onClick={() => setIsSheetOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-6">
                <LanguageSwitcher />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
