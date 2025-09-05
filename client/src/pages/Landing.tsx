import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Gamepad2, Monitor, Gift, Puzzle } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary to-accent/20"></div>
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Digital Gaming Marketplace
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover the best deals on PC games, software licenses, gift cards, and digital content
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-browse-games"
              >
                Browse Games
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-view-deals"
              >
                View Deals
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Demo Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-foreground">Featured Products</h2>
            <Button
              variant="ghost"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-view-all"
            >
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Demo Product Cards */}
            <Card className="product-card bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2" data-testid="card-demo-product-1">
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225"
                alt="Cyberpunk gaming scene"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">PC Game</Badge>
                  <div className="flex text-yellow-400">
                    <span className="text-xs text-muted-foreground">★ 4.8</span>
                  </div>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Cyberpunk 2077</h3>
                <p className="text-muted-foreground text-sm mb-3">Open-world action-adventure game</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground line-through">$59.99</span>
                    <span className="text-lg font-bold text-accent">$29.99</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/api/login'}
                    data-testid="button-demo-add-cart-1"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="product-card bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2" data-testid="card-demo-product-2">
              <img
                src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225"
                alt="Modern gaming setup"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">Software</Badge>
                  <div className="flex text-yellow-400">
                    <span className="text-xs text-muted-foreground">★ 4.9</span>
                  </div>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Windows 11 Pro</h3>
                <p className="text-muted-foreground text-sm mb-3">Professional operating system license</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-accent">$89.99</span>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/api/login'}
                    data-testid="button-demo-add-cart-2"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="product-card bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2" data-testid="card-demo-product-3">
              <img
                src="https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225"
                alt="Gaming controller"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-orange-500 text-white text-xs">Gift Card</Badge>
                  <Badge variant="destructive" className="text-xs font-medium">Hot Deal</Badge>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">Steam Gift Card</h3>
                <p className="text-muted-foreground text-sm mb-3">$50 Steam Wallet Credit</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground line-through">$50.00</span>
                    <span className="text-lg font-bold text-accent">$45.00</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/api/login'}
                    data-testid="button-demo-add-cart-3"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="product-card bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-2" data-testid="card-demo-product-4">
              <img
                src="https://images.unsplash.com/photo-1556438064-2d7646166914?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=225"
                alt="Console gaming setup"
                className="w-full h-48 object-cover"
              />
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Badge className="bg-accent text-accent-foreground text-xs">Console</Badge>
                  <div className="flex text-yellow-400">
                    <span className="text-xs text-muted-foreground">★ 4.7</span>
                  </div>
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">FIFA 24</h3>
                <p className="text-muted-foreground text-sm mb-3">PlayStation 5 Digital Download</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-accent">$39.99</span>
                  <Button
                    size="sm"
                    onClick={() => window.location.href = '/api/login'}
                    data-testid="button-demo-add-cart-4"
                  >
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Browse Categories</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center group cursor-pointer" onClick={() => window.location.href = '/api/login'} data-testid="category-pc-games">
              <div className="w-16 h-16 bg-primary rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gamepad2 className="text-2xl text-primary-foreground w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground">PC Games</h3>
              <p className="text-sm text-muted-foreground">2,450+ titles</p>
            </div>

            <div className="text-center group cursor-pointer" onClick={() => window.location.href = '/api/login'} data-testid="category-software">
              <div className="w-16 h-16 bg-accent rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Monitor className="text-2xl text-accent-foreground w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground">Software</h3>
              <p className="text-sm text-muted-foreground">850+ programs</p>
            </div>

            <div className="text-center group cursor-pointer" onClick={() => window.location.href = '/api/login'} data-testid="category-gift-cards">
              <div className="w-16 h-16 bg-orange-500 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="text-2xl text-white w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground">Gift Cards</h3>
              <p className="text-sm text-muted-foreground">50+ brands</p>
            </div>

            <div className="text-center group cursor-pointer" onClick={() => window.location.href = '/api/login'} data-testid="category-dlc">
              <div className="w-16 h-16 bg-purple-500 rounded-lg mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Puzzle className="text-2xl text-white w-8 h-8" />
              </div>
              <h3 className="font-semibold text-foreground">DLC & Addons</h3>
              <p className="text-sm text-muted-foreground">1,200+ items</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to Start Shopping?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of gamers and get instant access to your digital purchases
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-get-started"
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
}
