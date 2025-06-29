import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function WishlistPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Wishlist</CardTitle>
        <CardDescription>
          Your saved items for future purchases.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center text-muted-foreground py-8">
            <p>Your wishlist items will be displayed here.</p>
        </div>
      </CardContent>
    </Card>
  );
}
