import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function TopHeader() {
    return (
        <div className="bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 h-10 flex items-center justify-center relative text-sm">
                <div className="text-center">
                    <span>Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!</span>
                    <Link href="/products" className="font-semibold underline underline-offset-2 ml-2 text-primary-foreground hover:text-primary-foreground/80 transition-colors">
                        ShopNow
                    </Link>
                </div>
                <div className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 items-center cursor-pointer hover:text-primary-foreground/80 transition-colors">
                    <span>English</span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                </div>
            </div>
        </div>
    );
}
