"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { createPortal } from "react-dom";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "full";

interface ModalComponentProps {
	open: boolean;
	onClose: () => void;
	children: ReactNode;
	title?: ReactNode;
	size?: ModalSize;
	className?: string;
	closeOnBackdrop?: boolean;
}

const sizeClassMap: Record<ModalSize, string> = {
	sm: "max-w-sm",
	md: "max-w-md",
	lg: "max-w-lg",
	xl: "max-w-xl",
	"2xl": "max-w-2xl",
	"3xl": "max-w-3xl",
	"4xl": "max-w-4xl",
	full: "max-w-full",
};

export default function ModalComponent({
	open,
	onClose,
	children,
	title,
	size = "xl",
	className,
	closeOnBackdrop = true,
}: ModalComponentProps) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		return () => setMounted(false);
	}, []);

	useEffect(() => {
		if (!open) return;
		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				onClose();
			}
		};
		document.addEventListener("keydown", handleKeydown);
		return () => document.removeEventListener("keydown", handleKeydown);
	}, [open, onClose]);

	useEffect(() => {
		if (!open) return;
		const previousOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [open]);

	const panelClassName = useMemo(() => {
		return [
			"relative",
			"w-full",
			"max-h-[90vh]",
			"overflow-y-auto",
			"rounded-2xl",
			"bg-white",
			"p-6",
			"shadow-md",
			"dark:bg-zinc-900",
			sizeClassMap[size] ?? sizeClassMap.xl,
			className,
		]
			.filter(Boolean)
			.join(" ");
	}, [className, size]);

	if (!mounted || !open) {
		return null;
	}

	const portalTarget =
		typeof document !== "undefined"
			? document.getElementById("modal-root") ?? document.body
			: null;

	if (!portalTarget) {
		return null;
	}

	const handleBackdropClick = () => {
		if (closeOnBackdrop) {
			onClose();
		}
	};

	return createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8">
			<div
				className="absolute inset-0 bg-black/10"
				aria-hidden="true"
				onClick={handleBackdropClick}
			/>
			<div role="dialog" aria-modal="true" className={panelClassName}>
			<div className="mb-4 pb-2 flex items-center justify-between gap-4 border-b border-gray-100">
				<div className="flex-1 text-center">
					{title && (
						<h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
					)}
				</div>
				<button
					type="button"
					aria-label="Close modal"
					onClick={onClose}
					className="bg-gray-100 hover:bg-gray-200 rounded-sm p-2 transition text-gray-500 hover:text-gray-700 focus:outline-none dark:text-gray-300 dark:hover:text-white"
				>
					<XMarkIcon className="w-3 h-3" />
				</button>
			</div>
				<div>{children}</div>
			</div>
		</div>,
		portalTarget
	);
}
