import { createBrowserRouter, Navigate } from "react-router-dom";

import AppLayout from "./components/layout/AppLayout";
import PublicLayout from "./components/layout/PublicLayout";
import GalleryPage from "./pages/GalleryPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import IntroMobilePage from "./pages/intro/IntroMobilePage";
import IntroRootPage from "./pages/intro/IntroRootPage";
import IntroWebPage from "./pages/intro/IntroWebPage";

/**
 * 兩層 React Router 配置：
 *  - PublicLayout 承載 landing、intro、NotFoundPage
 *  - AppLayout 承載 Web SPA（部落格輸入與相簿檢視）
 *
 * 舊 URL 相容：
 *  - /web → /intro/web（可冷啟）
 *  - /web/app → /app/web（可冷啟）
 *  - /web/app/gallery/:blogId → /app/web（不帶 blogId，冷啟無法還原 gallery 狀態）
 */
const router = createBrowserRouter(
  [
    {
      element: <PublicLayout />,
      children: [
        { path: "/", element: <IntroRootPage /> },
        { path: "/intro/mobile", element: <IntroMobilePage /> },
        { path: "/intro/web", element: <IntroWebPage /> },
        { path: "/web", element: <Navigate to="/intro/web" replace /> },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
    {
      element: <AppLayout />,
      children: [
        { path: "/app/web", element: <HomePage /> },
        { path: "/app/web/gallery/:blogId", element: <GalleryPage /> },
      ],
    },
    { path: "/web/app", element: <Navigate to="/app/web" replace /> },
    {
      path: "/web/app/gallery/:blogId",
      element: <Navigate to="/app/web" replace />,
    },
  ],
  { basename: import.meta.env.BASE_URL },
);

export default router;
