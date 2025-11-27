import type { ReactNode } from "react";
import { useScrollHide } from "@/hooks/use-scroll-hide";

interface ScrollHiddenProps {
	children: ReactNode;
}
export function ScrollHidden({ children }: ScrollHiddenProps) {
	const hidden = useScrollHide();
	if (hidden) return null;
	return children;
}
