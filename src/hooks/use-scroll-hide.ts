import { useWindowScroll } from "@uidotdev/usehooks";
import { useEffect, useRef, useState } from "react";

export const useScrollHide = (threshold = 50) => {
	const [{ y }] = useWindowScroll();
	const [hidden, setHidden] = useState(false);
	const lastY = useRef(0);

	useEffect(() => {
		if (!y) return;

		if (y > lastY.current + threshold) {
			setHidden(true);
			lastY.current = y;
			return;
		}

		if (y < lastY.current - threshold) {
			setHidden(false);
			lastY.current = y;
			return;
		}
	}, [y, threshold]);

	return hidden;
};
