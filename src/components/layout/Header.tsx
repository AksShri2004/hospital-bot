'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, HeartPulse, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const navLinks = [
  { href: '/#symptom-checker', label: 'Symptom Checker' },
  { href: '/appointments', label: 'Appointments' },
  { href: '/profile', label: 'Medical Records' },
  { href: '/seed-data', label: 'Seed Data' },
];

export default function Header() {
  const pathname = usePathname();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const { user, loading } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await signOut(auth);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const NavLinks = ({ className, onLinkClick }: { className?: string; onLinkClick?: () => void }) => (
    <nav className={cn('flex items-center gap-4 lg:gap-6', className)}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onLinkClick}
          className={cn(
            'text-sm font-medium transition-colors hover:text-primary',
            (pathname === link.href || (link.href === '/#symptom-checker' && pathname === '/'))
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <HeartPulse className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg hidden sm:inline-block">HealthAssist AI</span>
          </Link>
          <div className="hidden md:flex">
            <NavLinks />
          </div>
        </div>

        <div className="hidden md:flex items-center gap-4">
          {loading ? null : user ? (
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{user.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center mb-6">
                  <Link href="/" onClick={() => setIsSheetOpen(false)} className="flex items-center gap-2">
                    <HeartPulse className="h-7 w-7 text-primary" />
                    <span className="font-bold text-lg">HealthAssist AI</span>
                  </Link>
                </div>
                <NavLinks className="flex-col items-start gap-4" onLinkClick={() => setIsSheetOpen(false)} />
                <div className="mt-auto flex flex-col space-y-2">
                  {loading ? null : user ? (
                    <Button variant="outline" onClick={() => { handleLogout(); setIsSheetOpen(false); }}>
                      Log Out
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" asChild>
                        <Link href="/login" onClick={() => setIsSheetOpen(false)}>Log In</Link>
                      </Button>
                      <Button asChild>
                        <Link href="/signup" onClick={() => setIsSheetOpen(false)}>Sign Up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
