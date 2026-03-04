// component/Navbar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isHome, setIsHome] = useState(false);

  useEffect(() => {
    setIsHome(pathname === '/');
  }, [pathname]);

  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo Link */}
        <Link href="/" className="text-white text-xl font-bold">
          FootballBuzz
        </Link>

        {/* Navigation Links */}
        <div className="space-x-4">
          <Link
            href="/"
            className={`text-gray-300 hover:text-white ${
              isHome ? 'underline' : ''
            }`}
          >
            Home
          </Link>
          <Link
            href="/players/search"
            className={`text-gray-300 hover:text-white ${
              pathname.includes('/players/search') ? 'underline' : ''
            }`}
          >
            Search Players
          </Link>
          {/* Add more links as needed */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;