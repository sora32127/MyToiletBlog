import { NavLink, Outlet } from "@remix-run/react";
import { FiChevronDown } from "react-icons/fi";


export default function Layout() {
    const menuItems = [
        {"name": "About", "to": "/about"},
        {"name": "Recent", "to": "/recents"},
    ]

    return (
        <div data-theme="light">
            <div className="navbar bg-base-100">
                <div className="navbar-start">
                </div>
                <div className="navbar-center">
                    <NavLink to="/" className="btn btn-ghost text-xl hover:bg-base-200 font-serif">現実モデリング</NavLink>
                </div>
                <div className="navbar-end">
                    <div className="hidden md:flex">
                        {menuItems.map((item) => (
                            <NavLink key={item.name} to={item.to} className="btn btn-ghost mx-1">{item.name}</NavLink>
                        ))}
                    </div>
                    <div className="dropdown dropdown-end md:hidden">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                            <FiChevronDown />
                        </div>
                        <ul className="bg-base-100 rounded-box mt-3 w-52 shadow menu menu-sm dropdown-content z-[1]">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <NavLink to={item.to} className="hover:bg-base-200">{item.name}</NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="content m-4 animate-fade-in md:w-3/4 md:mx-auto md:my-8 font-sans flex flex-col min-h-screen">
                <Outlet />
            </div>
                <footer className="footer footer-center bg-base-300 p-4 bottom-0">
                <aside>
                    <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
                </aside>
            </footer>
        </div>
  )
}