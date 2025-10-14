import { Outlet } from "@tanstack/react-router";
import { Footer } from "../Footer";
import { Header } from "../Header";

export function MainLayout() {
	return (
		<>
			<Header />
			<Outlet />
			<Footer />
		</>
	);
}
