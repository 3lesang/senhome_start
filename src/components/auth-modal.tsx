import { REGEXP_ONLY_DIGITS_AND_CHARS } from "input-otp";
import { useAtom } from "jotai";
import { XIcon } from "lucide-react";
import {
	authAtom,
	PHONE_VERIFY_OTP,
	SIGN_IN_TYPE,
	SIGN_UP_TYPE,
	setAuthTypeAtom,
	setOpenAtom,
} from "@/atom/auth";
import { Dialog, DialogClose, DialogContent } from "@/components/ui/dialog";
import {
	Item,
	ItemContent,
	ItemGroup,
	ItemMedia,
	ItemTitle,
} from "@/components/ui/item";
import { SigninForm } from "./signin-form";
import { SignupForm } from "./signup-form";
import { Button } from "./ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "./ui/input-otp";

const models = [
	{
		name: "Voucher ưu đãi",
		image: "/mceclip4_37.avif",
	},
	{
		name: "Quà tặng độc quyền",
		image: "/mceclip5_49.avif",
	},
];

function Signup() {
	const [, setAuthType] = useAtom(setAuthTypeAtom);
	return (
		<div>
			<SignupForm />
			<div className="flex mt-4 justify-between">
				<button
					type="button"
					className="cursor-pointer text-xs text-blue-800 font-semibold hover:underline"
					onClick={() => {
						setAuthType(SIGN_IN_TYPE);
					}}
				>
					Đăng nhập
				</button>
				<button
					type="button"
					className="cursor-pointer text-xs text-blue-800 font-semibold hover:underline"
				>
					Quên mật khẩu
				</button>
			</div>
		</div>
	);
}

function Signin() {
	const [, setAuthType] = useAtom(setAuthTypeAtom);
	return (
		<div>
			<SigninForm />
			<div className="flex mt-4 justify-between">
				<button
					type="button"
					className="cursor-pointer text-xs text-blue-800 font-semibold hover:underline"
					onClick={() => {
						setAuthType(SIGN_UP_TYPE);
					}}
				>
					Đăng kí tài khoản mới
				</button>
				<button
					type="button"
					className="cursor-pointer text-xs text-blue-800 font-semibold hover:underline"
				>
					Quên mật khẩu
				</button>
			</div>
		</div>
	);
}

function PhoneVerifyOtp() {
	return (
		<div>
			<InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS_AND_CHARS}>
				<InputOTPGroup>
					<InputOTPSlot index={0} />
					<InputOTPSlot index={1} />
					<InputOTPSlot index={2} />
					<InputOTPSlot index={3} />
					<InputOTPSlot index={4} />
					<InputOTPSlot index={5} />
				</InputOTPGroup>
			</InputOTP>
		</div>
	);
}

export function AuthPromo() {
	return (
		<div>
			<p className="font-bold text-2xl">
				Rất nhiều đặc quyền và quyền lợi mua sắm đang chờ bạn
			</p>
			<div className="my-4">
				<p className="text-xs mb-2">
					Quyền lợi dành riêng cho bạn khi tham gia
				</p>
				<ItemGroup className="grid grid-cols-2 gap-4">
					{models.map((model) => (
						<Item key={model.name} variant="outline">
							<ItemMedia>
								<img src={model.image} alt="" />
							</ItemMedia>
							<ItemContent>
								<ItemTitle>{model.name}</ItemTitle>
							</ItemContent>
						</Item>
					))}
				</ItemGroup>
			</div>
		</div>
	);
}

export function AuthModal() {
	const [{ open, type }] = useAtom(authAtom);
	const [_, setOpen] = useAtom(setOpenAtom);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent className="" showCloseButton={false}>
				<AuthPromo />
				{type === SIGN_UP_TYPE && <Signup />}
				{type === SIGN_IN_TYPE && <Signin />}
				{type === PHONE_VERIFY_OTP && <PhoneVerifyOtp />}
				<DialogClose asChild className="absolute -top-4 -right-4">
					<Button
						type="button"
						className="rounded-full cursor-pointer border border-white shadow"
						size="icon"
					>
						<XIcon />
					</Button>
				</DialogClose>
			</DialogContent>
		</Dialog>
	);
}
