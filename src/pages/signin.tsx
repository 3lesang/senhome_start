import { SigninForm } from "@/components/signin-form";
import { Link } from "@tanstack/react-router";

export function SigninPage() {
	return <div className="py-8">
		<div className="max-w-lg mx-auto">
			<SigninForm />
			<div className="flex mt-4 justify-between">
				<Link
					to="/signup"
					className="cursor-pointer text-xs text-blue-800 font-semibold hover:underline"
				>
					Đăng kí tài khoản mới
				</Link>
				<Link
					to="/"
					className="cursor-pointer text-xs text-blue-800 font-semibold hover:underline"
				>
					Quên mật khẩu
				</Link>
			</div>
		</div>
	</div>

}
