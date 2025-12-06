import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useAtom } from "jotai";
import { EyeIcon } from "lucide-react";
import { toast } from "sonner";
import z from "zod";
import { SIGN_IN_TYPE, setAuthTypeAtom } from "@/atom/auth";
import axiosClient from "@/axios";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "./ui/spinner";

const schema = z.object({
	name: z.string(),
	phone: z.string().min(1, "Phone is requied"),
	password: z.string().min(1, "Password is requied"),
});

type FormValues = z.infer<typeof schema>;

export function SignupForm() {
	const [, setAuthType] = useAtom(setAuthTypeAtom);

	const form = useForm({
		defaultValues: {
			name: "",
			phone: "",
			password: "",
		},
		validators: {
			onSubmit: schema,
		},
		onSubmit: ({ value }) => signupMutation.mutateAsync(value),
	});

	const signupMutation = useMutation({
		mutationFn: (value: FormValues) => {
			return axiosClient.post("/customers/register", {
				name: value.name,
				phone: value.phone,
				password: value.password,
			});
		},
		onSuccess: () => {
			form.reset();
			toast.success("Đăng kí tài khoản thành công!");
			setAuthType(SIGN_IN_TYPE);
		},
	});

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				form.handleSubmit();
			}}
			className="lg:w-[464px] mx-auto"
		>
			<div className="grid grid-cols-2 gap-4">
				<form.Field name="name">
					{(field) => (
						<Field className="col-span-1">
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
						<Field className="col-span-1">
							<FieldLabel>Số điện thoại</FieldLabel>
							<Input
								placeholder="Số điện thoại"
								value={field.state.value}
								onChange={(e) => field.handleChange(e.currentTarget.value)}
							/>
						</Field>
					)}
				</form.Field>
				<form.Field name="password">
					{(field) => (
						<Field className="col-span-2">
							<FieldLabel>Mật khẩu</FieldLabel>
							<InputGroup className="rounded-full h-10">
								<InputGroupInput
									placeholder="Mật khẩu"
									type="password"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.currentTarget.value)}
								/>

								<InputGroupAddon align="inline-end">
									<InputGroupButton type="button" size="icon-sm">
										<EyeIcon />
									</InputGroupButton>
								</InputGroupAddon>
							</InputGroup>
						</Field>
					)}
				</form.Field>
			</div>
			<Button
				type="submit"
				className="cursor-pointer rounded-full w-full mt-8 uppercase"
				size="lg"
				disabled={signupMutation.isPending}
			>
				{signupMutation.isPending && <Spinner />}
				Đăng ký tài khoản
			</Button>
		</form>
	);
}
