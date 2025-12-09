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

export function AccountInfoPage() {
	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
			}}
		>
			<Card className="w-full border-0 shadow-none">
				<CardHeader>
					<CardTitle>Thông tin tài khoản</CardTitle>
				</CardHeader>
				<CardContent className="grid grid-cols-12 gap-4">
					<Field className="col-span-6">
						<FieldLabel>Họ và tên</FieldLabel>
						<Input placeholder="Họ và tên" />
					</Field>
					<Field className="col-span-6">
						<FieldLabel>Email</FieldLabel>
						<Input placeholder="Email" />
					</Field>
					<Field className="col-span-12">
						<FieldLabel>Số điện thoại</FieldLabel>
						<Input placeholder="Số điện thoại" disabled />
					</Field>
					<Field className="col-span-12">
						<FieldLabel>Mật khẩu</FieldLabel>
						<Input placeholder="Mật khẩu" type="password" />
					</Field>
				</CardContent>
				<CardFooter className="justify-end">
					<Button type="submit">Cập nhật</Button>
				</CardFooter>
			</Card>
		</form>
	);
}
