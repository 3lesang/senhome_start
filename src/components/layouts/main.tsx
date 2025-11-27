import { Outlet } from "@tanstack/react-router";
import { AuthModal } from "@/components/auth-modal";
import { Footer } from "../footer";
import { Header } from "../header";

export function MainLayout() {
	return (
		<>
			<Header />
			<Outlet />
			<AuthModal />
			<Footer />
		</>
	);
}
