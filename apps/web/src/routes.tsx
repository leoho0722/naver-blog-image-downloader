import { createBrowserRouter } from "react-router-dom";

import RootLayout from "./components/layout/RootLayout";
import GalleryPage from "./pages/GalleryPage";
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

const router = createBrowserRouter(
  [
    {
      element: <RootLayout />,
      children: [
        { path: "/", element: <HomePage /> },
        { path: "/gallery/:blogId", element: <GalleryPage /> },
        { path: "*", element: <NotFoundPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);

export default router;
