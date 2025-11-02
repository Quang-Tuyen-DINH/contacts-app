'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import "../../../styles/shared/components/layout/navbar.scss"

const headersData = [
  { label: 'Dashboard', id: 'dashboard', href: '/dashboard' },
  { label: 'Contacts', id: 'contacts', href: '/contacts' },
];

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div>
      <ul className="navbar-container">
        {headersData.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(`${item.href}/`));

          return (
            <li
              key={item.id}
              className={isActive ? 'navbar-container__element-active' : 'navbar-container__element'}
            >
              <Link href={item.href} aria-current={isActive ? 'page' : undefined}>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Navbar;