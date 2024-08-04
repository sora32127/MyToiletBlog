import { Outlet } from "@remix-run/react";
import { H1 } from "~/Components/Headings";

export default function Edit() {
    return (
        <div>
            <H1>編集ページ</H1>
            <br></br>
            <Outlet />
        </div>
    );
}