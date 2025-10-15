import { Outlet } from "@tanstack/react-router";
import { Header } from "../Header";

export function SecondLayout() {
	return (
		<>
			<Header />
			<Outlet />
		</>
	);
}
