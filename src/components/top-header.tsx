import Link from "next/link";

export function TopHeader() {
    return (
        <div className="bg-black text-white py-3 text-sm">
            <div className="container mx-auto px-4 flex justify-center md:justify-between items-center">
                <div className="text-center md:text-left">
                    <span>Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!</span>
                    <Link href="#" className="font-semibold underline ml-2">ShopNow</Link>
                </div>
                <div className="hidden md:block">
                    {/* Language selector can go here */}
                </div>
            </div>
        </div>
    )
}
