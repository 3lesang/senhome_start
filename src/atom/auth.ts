import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const SIGN_UP_TYPE = 1;
export const SIGN_IN_TYPE = 2;
export const PHONE_VERIFY_OTP = 3;

export type AuthState = {
	open: boolean;
	type: typeof SIGN_IN_TYPE | typeof SIGN_UP_TYPE | null;
};

export type CustomerType = {
	id: number;
	name: string;
};

export const tokenAtom = atomWithStorage<string | null>("token", null, {
	getItem: (key) => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(key);
	},
	setItem: (key, value) => {
		if (typeof window === "undefined") return;
		if (value) {
			localStorage.setItem(key, value);
		} else {
			localStorage.removeItem(key);
		}
	},
	removeItem: (key) => {
		if (typeof window === "undefined") return;
		localStorage.removeItem(key);
	},
});

export const customerAtom = atomWithStorage<CustomerType | null>(
	"customer",
	null,
	{
		getItem: (key) => {
			if (typeof window === "undefined") return null;
			const stored = localStorage.getItem(key);
			return stored ? JSON.parse(stored) : null;
		},
		setItem: (key, value) => {
			if (typeof window === "undefined") return;
			if (value) {
				localStorage.setItem(key, JSON.stringify(value));
			} else {
				localStorage.removeItem(key);
			}
		},
		removeItem: (key) => {
			if (typeof window === "undefined") return;
			localStorage.removeItem(key);
		},
	},
);

export const authAtom = atom<AuthState>({
	open: false,
	type: null,
});

export const setAuthTypeAtom = atom(
	null,
	(get, set, type: AuthState["type"]) => {
		set(authAtom, { ...get(authAtom), type });
	},
);

export const setOpenAtom = atom(null, (get, set, open: boolean) => {
	set(authAtom, { ...get(authAtom), open });
});
