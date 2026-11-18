import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { MainLayout } from "../components/layout/MainLayout"
import { Home } from "../pages/Home"
import { Browse } from "../pages/Browse"
import { NovelDetail } from "../pages/NovelDetail"
import { Reader } from "../pages/Reader"
import { Login } from "../pages/Login"
import { Register } from "../pages/Register"

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/novel/:slug" element={<NovelDetail />} />
          <Route path="/read/:slug/:index" element={<Reader />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
