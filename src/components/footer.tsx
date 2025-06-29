import { Leaf, Twitter, Facebook, Instagram } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-muted/50 mt-16 md:mt-24">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary mb-4">
              <Leaf className="h-7 w-7" />
              <span className="font-headline">Verdant Market</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Your source for the freshest organic produce and artisanal goods.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 md:col-span-3">
              <div>
                  <h4 className="font-semibold mb-4">Shop</h4>
                  <ul className="space-y-2">
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">All Products</Link></li>
                      <li><Link href="#categories-section" className="text-sm text-muted-foreground hover:text-primary">Categories</Link></li>
                      <li><Link href="#new-arrivals" className="text-sm text-muted-foreground hover:text-primary">New Arrivals</Link></li>
                  </ul>
              </div>
              <div>
                  <h4 className="font-semibold mb-4">About Us</h4>
                  <ul className="space-y-2">
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Our Story</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Careers</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Blog</Link></li>
                  </ul>
              </div>
              <div>
                  <h4 className="font-semibold mb-4">Support</h4>
                  <ul className="space-y-2">
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Contact Us</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">FAQ</Link></li>
                      <li><Link href="#" className="text-sm text-muted-foreground hover:text-primary">Shipping & Returns</Link></li>
                  </ul>
              </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Verdant Market. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <Link href="#" aria-label="Twitter"><Twitter className="h-5 w-5 hover:text-primary" /></Link>
            <Link href="#" aria-label="Facebook"><Facebook className="h-5 w-5 hover:text-primary" /></Link>
            <Link href="#" aria-label="Instagram"><Instagram className="h-5 w-5 hover:text-primary" /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
