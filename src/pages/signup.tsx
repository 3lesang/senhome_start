import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
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

const schema = z.object({
	phone: z.string().min(1, "Phone is requied"),
	password: z.string().min(1, "Password is requied"),
});

type FormValues = z.infer<typeof schema>;

export function SignupPage() {
	const form = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues: {
			phone: "",
			password: "",
		},
	});
	function handleSubmit(values: FormValues) {
		console.log(values);
	}
	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="bg-neutral-50 h-screen flex justify-center items-center"
			>
				<Card className="w-96 border-0 shadow-none">
					<CardHeader>
						<CardTitle>Đăng ký</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
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
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mật khẩu</FormLabel>
									<FormControl>
										<Input {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</CardContent>
					<CardFooter>
						<Button type="submit" className="w-full" size="lg">
							Đăng ký
						</Button>
					</CardFooter>
				</Card>
			</form>
		</Form>
	);
}
