import { NavLink, Outlet } from "@remix-run/react";

export default function Layout() {
  return (
    <div>
        <div className="navbar bg-base-100">
            <div className="flex-1">
                <NavLink to="/" className="btn btn-ghost text-xl">現実モデリング</NavLink>
            </div>
            <div className="flex-none gap-2">
                <div className="form-control">
                    <input type="text" placeholder="Search..." className="input input-bordered w-24 md:w-auto" />
                </div>
                <div className="dropdown dropdown-end">
                    <ul>
                        <NavLink to="/About">About</NavLink>
                    </ul>
                </div>
            </div>
        </div>
        <Outlet />
    </div>
  )
}