import { Outlet } from "@tanstack/react-router";
import { Separator } from "@/components/ui/separator";
import { Footer } from "../Footer";
import { Header } from "../Header";

export function MainLayout() {
	return (
		<>
			<Header />
			<Outlet />
			<Separator />
			<Footer />
		</>
	);
}
