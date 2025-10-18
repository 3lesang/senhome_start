import { Outlet } from "@tanstack/react-router";
import { Header } from "../header";

export function SecondLayout() {
	return (
		<div className="flex flex-col min-h-screen">
			<Header />
			<Outlet />
		</div>
	);
}
