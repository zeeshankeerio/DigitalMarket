import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart } from "./ShoppingCart";
import { useQuery } from "@tanstack/react-query";
import { Gamepad2, Search, Sun, Moon, ShoppingCart as CartIcon, Menu, User, Settings, LogOut } from "lucide-react";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  quantity: number;
  imageUrl?: string;
  platform?: string;
}

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  
  // Load cart items from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('digitalstore-cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Failed to parse saved cart:', e);
      }
    }
    
    // Listen for cart updates
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'digitalstore-cart' && e.newValue) {
        try {
          setCartItems(JSON.parse(e.newValue));
        } catch (error) {
          console.error('Failed to parse cart update:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const { data: categories = [] } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateCartItem = (id: string, quantity: number) => {
    const updatedItems = cartItems
      .map(item => item.id === id ? { ...item, quantity } : item)
      .filter(item => item.quantity > 0);
    setCartItems(updatedItems);
    localStorage.setItem('digitalstore-cart', JSON.stringify(updatedItems));
  };

  const removeCartItem = (id: string) => {
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    localStorage.setItem('digitalstore-cart', JSON.stringify(updatedItems));
  };

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" data-testid="link-home">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Gamepad2 className="text-primary-foreground w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-foreground">GameStore</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search games, software, gift cards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10"
                data-testid="input-search"
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                data-testid="button-search"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === 'light' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Shopping Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" data-testid="button-cart">
                  <CartIcon className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      data-testid="badge-cart-count"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent className="w-96">
                <ShoppingCart
                  items={cartItems}
                  onUpdateQuantity={updateCartItem}
                  onRemoveItem={removeCartItem}
                />
              </SheetContent>
            </Sheet>

            {/* User Account / Auth */}
            {isAuthenticated ? (
              <div className="hidden md:flex items-center space-x-2">
                {user?.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                    data-testid="img-profile"
                  />
                ) : (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                <Link href="/profile" data-testid="link-profile">
                  <Button variant="ghost" size="sm">
                    {user?.firstName || user?.email}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="button-logout"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-login"
                >
                  Login
                </Button>
                <Button
                  size="sm"
                  onClick={() => window.location.href = '/api/login'}
                  data-testid="button-signup"
                >
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      data-testid="input-mobile-search"
                    />
                  </div>
                  {!isAuthenticated ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = '/api/login'}
                        data-testid="button-mobile-login"
                      >
                        Login
                      </Button>
                      <Button
                        onClick={() => window.location.href = '/api/login'}
                        data-testid="button-mobile-signup"
                      >
                        Sign Up
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/profile" data-testid="link-mobile-profile">
                        <Button variant="outline" className="w-full justify-start">
                          Profile
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        onClick={() => window.location.href = '/api/logout'}
                        data-testid="button-mobile-logout"
                      >
                        Logout
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Categories */}
        <div className="hidden md:flex items-center space-x-8 mt-4 pt-4 border-t border-border">
          <Link href="/?featured=true" data-testid="link-featured">
            <span className={`font-medium transition-colors ${location === '/?featured=true' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              Featured
            </span>
          </Link>
          {categories.map((category: any) => (
            <Link key={category.id} href={`/?category=${category.id}`} data-testid={`link-category-${category.slug}`}>
              <span className={`transition-colors ${location === `/?category=${category.id}` ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
