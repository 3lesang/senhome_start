import { Outlet } from "@tanstack/react-router";
import { Footer } from "../footer";
import { Header } from "../header";

export function MainLayout() {
	return (
		<>
			<Header />
			<Outlet />
			<Footer />
		</>
	);
}
