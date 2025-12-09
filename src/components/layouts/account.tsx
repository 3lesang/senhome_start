import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useAtom } from "jotai";
import {
	PercentIcon,
	PowerIcon,
	ShoppingCartIcon,
	UserIcon,
} from "lucide-react";
import { customerAtom, tokenAtom } from "@/atom/auth";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "../ui/button";
import { Card, CardContent } from "../ui/card";

export function AccountLayout() {
	const navigate = useNavigate();
	const [, setToken] = useAtom(tokenAtom);
	const [, setCustomer] = useAtom(customerAtom);
	const items = [
		{
			to: "/account/info",
			name: "Thông tin tài khoản",
			icon: UserIcon,
		},
		{
			to: "/account/order",
			name: "Lịch sử đơn hàng",
			icon: ShoppingCartIcon,
		},
		{
			to: "/account/voucher",
			name: "Ví Voucher",
			icon: PercentIcon,
		},
	];
	function handleLogout() {
		setToken(null);
		setCustomer(null);
		navigate({ to: "/" });
	}
	return (
		<main className="bg-neutral-50 py-16">
			<div className="container mx-auto grid grid-cols-12 lg:gap-16">
				<div className="col-span-3">
					<Card className="border-0 shadow-none">
						<CardContent>
							{items.map((i) => (
								<Link
									key={i.to}
									to={i.to}
									className={cn(
										buttonVariants({ variant: "ghost" }),
										"w-full justify-start",
									)}
								>
									<i.icon />
									{i.name}
								</Link>
							))}
							<Button
								type="button"
								variant="ghost"
								className="w-full justify-start cursor-pointer"
								onClick={handleLogout}
							>
								<PowerIcon />
								Đăng xuất
							</Button>
						</CardContent>
					</Card>
				</div>
				<div className="col-span-9">
					<Outlet />
				</div>
			</div>
		</main>
	);
}
