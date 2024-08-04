import { NavLink, Outlet } from "@remix-run/react";
import { useEffect, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import { CiDark, CiLight } from "react-icons/ci";


export default function Layout() {
    const [theme, setTheme] = useState("");
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "sunset";
        setTheme(savedTheme);
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, []);

    const menuItems = [
        {"name": "About", "to": "/about"},
        {"name": "Recent", "to": "/recents"},
    ]

    const handleThemeChange = () => {
        const newTheme = theme === "sunset" ? "nord" : "sunset";
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    }

    return (
        <div>
            <div className="navbar bg-base-100">
                <div className="navbar-start">
                    <button onClick={handleThemeChange} className="btn btn-ghost btn-circle text-xl hover:bg-base-200">
                        {theme === "dark" ? <CiDark /> : <CiLight />}
                    </button>
                </div>
                <div className="navbar-center">
                    <NavLink to="/" className="btn btn-ghost text-xl hover:bg-base-200 font-otsutome">現実モデリング</NavLink>
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
                        <ul tabIndex={0} className="bg-base-100 rounded-box mt-3 w-52 shadow menu menu-sm dropdown-content z-[1]">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <NavLink to={item.to} className="hover:bg-base-200">{item.name}</NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="content m-4 animate-fade-in md:w-3/4 md:mx-auto md:my-8">
                <Outlet />
            </div>
        </div>
  )
}