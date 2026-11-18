import { useEffect, useState } from "react"

type Theme = "dark" | "light"

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem("THEME") as Theme) || "dark")
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem("THEME", theme)
  }, [theme])
  return { theme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }
}
