import { useState, useEffect } from "react";

export default function ThemeToggle() {
	const [isDark, setIsDark] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const theme = document.documentElement.getAttribute("data-theme");
		setIsDark(theme === "dark");
	}, []);

	const toggleTheme = () => {
		const newIsDark = !isDark;
		setIsDark(newIsDark);
		document.documentElement.setAttribute(
			"data-theme",
			newIsDark ? "dark" : "light",
		);
		localStorage.setItem("theme", newIsDark ? "dark" : "light");
	};

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted) {
		return (
			<button
				className="theme-toggle"
				aria-label="Toggle dark mode"
				suppressHydrationWarning
			>
				<span className="theme-toggle-icon">☀</span>
			</button>
		);
	}

	return (
		<button
			className="theme-toggle"
			onClick={toggleTheme}
			aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
			title={isDark ? "Switch to light mode" : "Switch to dark mode"}
		>
			<span className="theme-toggle-icon">{isDark ? "☀" : "☾"}</span>
		</button>
	);
}
