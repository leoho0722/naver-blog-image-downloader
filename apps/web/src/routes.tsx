import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import PublicLayout from "./components/layout/PublicLayout";
import GalleryPage from "./pages/GalleryPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";

/**
 * 兩層 React Router 配置：
 *  - PublicLayout 承載 landing、privacy、NotFoundPage
 *  - AppLayout 承載 Web SPA（部落格輸入與相簿檢視）
 *
 * 舊 URL 相容（皆為 <Navigate replace>，不留在瀏覽紀錄裡）：
 *  - /web、/intro/web、/intro/mobile → /
 *    （前兩者的內容已併入首頁；行動版 App 已下架，介紹頁一併移除）
 *  - /web/app、/app/web → /app
 *  - /web/app/gallery/:blogId、/app/web/gallery/:blogId → /app
 *    （不帶 blogId，因為冷啟時沒有照片 state，帶了也還原不出相簿）
 */
export const appRoutes = [
  {
    Component: PublicLayout,
    children: [
      { path: "/", Component: LandingPage },
      { path: "/privacy", Component: PrivacyPolicyPage },
      { path: "/web", element: <Navigate to="/" replace /> },
      { path: "/intro/web", element: <Navigate to="/" replace /> },
      { path: "/intro/mobile", element: <Navigate to="/" replace /> },
      { path: "*", Component: NotFoundPage },
    ],
  },
  {
    Component: AppLayout,
    children: [
      { path: "/app", Component: HomePage },
      { path: "/app/gallery/:blogId", Component: GalleryPage },
    ],
  },
  { path: "/web/app", element: <Navigate to="/app" replace /> },
  { path: "/app/web", element: <Navigate to="/app" replace /> },
  {
    path: "/web/app/gallery/:blogId",
    element: <Navigate to="/app" replace />,
  },
  {
    path: "/app/web/gallery/:blogId",
    element: <Navigate to="/app" replace />,
  },
];

export function createAppRouter(basename = import.meta.env.BASE_URL) {
  return createBrowserRouter(appRoutes, { basename });
}
