import { zodResolver } from "@hookform/resolvers/zod";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { InfoIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { createOrderHandler } from "@/api/order/create";
import { DistrictSelect } from "@/components/address/district";
import { ProvinceSelect } from "@/components/address/province";
import { WardSelect } from "@/components/address/ward";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Item,
	ItemActions,
	ItemContent,
	ItemDescription,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatVND } from "@/lib/utils";
import { orderCollection } from "@/stores/db";

const schema = z.object({
	name: z.string().min(1, "Vui lòng nhập tên"),
	phone: z.string().regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
	email: z.email("Email không hợp lệ"),
	street: z.string(),
	province: z.object({
		value: z.string(),
		label: z.string().min(1, "Name is required"),
	}),
	district: z.object({
		value: z.string(),
		label: z.string().min(1, "Name is requied"),
	}),
	ward: z.object({
		value: z.string(),
		label: z.string().min(1, "Name is requied"),
	}),
	payment: z.enum(["cod"]),
	status: z.enum(["created"]),
	note: z.string(),
	items: z.array(
		z.object({
			price: z.number(),
			sale_price: z.number(),
			product: z.string(),
			variant: z.string(),
			quantity: z.number(),
		}),
	),
});

type FormValues = z.infer<typeof schema>;

export function CheckoutPage() {
	const navigate = useNavigate();
	const { data } = useLiveQuery((q) =>
		q
			.from({ order: orderCollection })
			.where(({ order }) => eq(order.id, 1))
			.select(({ order }) => ({
				id: order?.id,
				name: order?.name,
				phone: order?.phone,
				email: order?.email,
				street: order?.street,
				province: order?.province,
				district: order?.district,
				ward: order?.ward,
				items: order?.items,
			})),
	);
	const order = data[0];

	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			name: order?.name ?? "",
			phone: order?.phone ?? "",
			email: order?.email ?? "",
			street: order?.street,
			province: order?.province,
			district: order?.district,
			ward: order?.ward,
			payment: "cod",
			status: "created",
			note: "",
			items: order.items,
		},
	});

	const { mutate, isPending } = useMutation({
		mutationFn: createOrderHandler,
		onSuccess: (data) => {
			navigate({ to: "/order/success", search: { id: data.id } });
			toast.success("Order created");
		},
	});

	function handleSubmit(values: FormValues) {
		mutate(values);
		orderCollection.update(order.id, (order) => {
			order.name = values.name;
			order.phone = values.phone;
			order.email = values.email;
			order.street = values.street;
			order.province = values.province;
			order.district = values.district;
			order.ward = values.ward;
		});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)}>
				<main className="bg-neutral-50 min-h-screen pt-8">
					<div className="max-w-5xl mx-auto ">
						<Item variant="muted">
							<ItemMedia>
								<Button type="button" variant="ghost" size="icon-sm">
									<InfoIcon />
								</Button>
							</ItemMedia>
							<ItemContent>
								<ItemTitle>Chưa có tài khoản?</ItemTitle>
							</ItemContent>
							<ItemActions>
								<Link to="/signup" className={cn(buttonVariants())}>
									Đăng ký
								</Link>
							</ItemActions>
						</Item>
						<div className="grid grid-cols-12 gap-4 mt-8">
							<div className="col-span-7 space-y-4">
								<Card className="border-0 shadow-none">
									<CardHeader>
										<CardTitle>Thông tin giao hàng</CardTitle>
									</CardHeader>
									<CardContent className="grid grid-cols-12 gap-4">
										<FormField
											control={form.control}
											name="name"
											render={({ field }) => (
												<FormItem className="col-span-6">
													<FormLabel>Họ và tên</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="phone"
											render={({ field }) => (
												<FormItem className="col-span-6">
													<FormLabel>Số điện thoại</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="email"
											render={({ field }) => (
												<FormItem className="col-span-12">
													<FormLabel>Email</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="street"
											render={({ field }) => (
												<FormItem className="col-span-12">
													<FormLabel>Địa chỉ, tên đường</FormLabel>
													<FormControl>
														<Input {...field} />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="province"
											render={({ field }) => (
												<FormItem className="col-span-4">
													<FormLabel>Tỉnh/TP</FormLabel>
													<FormControl>
														<ProvinceSelect
															value={field.value}
															onChange={(value) => {
																field.onChange(value);
																form.setValue("district", {
																	label: "",
																	value: "",
																});
															}}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="district"
											render={({ field }) => (
												<FormItem className="col-span-4">
													<FormLabel>Quận/Huyện</FormLabel>
													<FormControl>
														<DistrictSelect
															value={field.value}
															onChange={(value) => {
																field.onChange(value);
																form.setValue("ward", {
																	label: "",
																	value: "",
																});
															}}
															id={form.watch("province")?.value}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="ward"
											render={({ field }) => (
												<FormItem className="col-span-4">
													<FormLabel>Phường/Xã</FormLabel>
													<FormControl>
														<WardSelect
															value={field.value}
															onChange={field.onChange}
															id={form.watch("district")?.value}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="note"
											render={({ field }) => (
												<FormItem className="col-span-12">
													<FormLabel>Ghi chú đơn hàng</FormLabel>
													<FormControl>
														<Textarea {...field} className="resize-none" />
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>
								<Card className="border-0 shadow-none">
									<CardHeader>
										<CardTitle>Phương thức thanh toán</CardTitle>
									</CardHeader>
									<CardContent>
										<FormField
											control={form.control}
											name="payment"
											render={({ field }) => (
												<FormItem>
													<FormControl>
														<RadioGroup {...field}>
															<Label>
																<RadioGroupItem value="cod" />
																Thanh toán khi giao hàng (COD)
															</Label>
														</RadioGroup>
													</FormControl>
												</FormItem>
											)}
										/>
									</CardContent>
								</Card>
							</div>
							<div className="col-span-5 space-y-4">
								<Card className="border-0 shadow-none">
									<CardHeader>
										<CardTitle>Giỏ hàng</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2">
										{order?.items.map((item) => (
											<Item key={item.id} variant="muted">
												<ItemMedia>
													<Avatar className="rounded-md">
														<AvatarImage src={item.thumbnail} />
														<AvatarFallback />
													</Avatar>
												</ItemMedia>
												<ItemContent>
													<ItemTitle className="line-clamp-2">
														<Link
															to="/products/$id"
															params={{ id: item.slug }}
															className="hover:underline"
														>
															{item.name}
														</Link>
													</ItemTitle>
													<ItemDescription className="space-x-2">
														{item.combos.split(",").map((item) => (
															<Badge key={item} variant="secondary">
																{item}
															</Badge>
														))}
														<Badge>Số lượng {item.quantity}</Badge>
													</ItemDescription>
												</ItemContent>
												<ItemActions>{formatVND(item.sale_price)}</ItemActions>
											</Item>
										))}
									</CardContent>
								</Card>
								<Card className="border-0 shadow-none">
									<CardHeader>
										<CardTitle>Tóm tắt đơn hàng</CardTitle>
									</CardHeader>
									<CardContent></CardContent>
									<CardFooter>
										<Button
											type="submit"
											size="lg"
											className="w-full"
											disabled={!form.formState.isValid || isPending}
										>
											{isPending && <Spinner />}
											Đặt hàng
										</Button>
									</CardFooter>
								</Card>
							</div>
						</div>
					</div>
				</main>
			</form>
		</Form>
	);
}
