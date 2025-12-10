import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import z from "zod";
import axiosClient from "@/axios";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { getMeQueryOptions } from "@/queries/customer";

const schema = z.object({
	name: z.string().optional(),
	phone: z.string().optional(),
	email: z.string().optional(),
	password: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function AccountInfoPage() {
	const getMeQuery = useQuery(getMeQueryOptions());

	const updateMeMutation = useMutation({
		mutationFn: (value: FormValues) => {
			return axiosClient.post("/customers/me", value);
		},
		onSuccess: () => {
			toast.success("Cập nhật thành công!");
		},
	});

	const form = useForm({
		defaultValues: {
			name: getMeQuery.data?.name ?? "",
			phone: getMeQuery.data?.phone ?? "",
			email: getMeQuery.data?.email ?? "",
			password: "",
		},
		onSubmit: ({ value }) => updateMeMutation.mutateAsync(value),
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			<Card className="w-full border-0 shadow-none">
				<CardHeader>
					<CardTitle>Thông tin tài khoản</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-12 gap-4">
					<form.Field name="name">
						{(field) => (
							<Field className="col-span-6">
								<FieldLabel>Họ và tên</FieldLabel>
								<Input
									placeholder="Họ và tên"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.currentTarget.value)}
								/>
							</Field>
						)}
					</form.Field>
					<form.Field name="phone">
						{(field) => (
							<Field className="col-span-6">
								<FieldLabel>Số điện thoại</FieldLabel>
								<Input
									disabled
									placeholder="Số điện thoại"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.currentTarget.value)}
								/>
							</Field>
						)}
					</form.Field>
					<form.Field name="email">
						{(field) => (
							<Field className="col-span-12">
								<FieldLabel>Email</FieldLabel>
								<Input
									placeholder="Email"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.currentTarget.value)}
								/>
							</Field>
						)}
					</form.Field>
					<form.Field name="password">
						{(field) => (
							<Field className="col-span-12">
								<FieldLabel>Mật khẩu</FieldLabel>
								<Input
									type="password"
									placeholder="Mật khẩu"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.currentTarget.value)}
								/>
							</Field>
						)}
					</form.Field>
				</CardContent>
				<CardFooter className="justify-end">
					<Button type="submit" disabled={updateMeMutation.isPending}>
						{updateMeMutation.isPending && <Spinner />}
						Cập nhật
					</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
