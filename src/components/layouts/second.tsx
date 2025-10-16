import { Outlet } from "@tanstack/react-router";
import { Header } from "../header";

export function SecondLayout() {
	return (
		<>
			<Header />
			<Outlet />
		</>
	);
}
