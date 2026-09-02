import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Effects from "../pages/effects/page";
import EffectDetail from "../pages/effect/page";
import Community from "../pages/community/page";
import Submit from "../pages/submit/page";
import About from "../pages/about/page";
import Contact from "../pages/contact/page";
import Login from "../pages/auth/login/page";
import Signup from "../pages/auth/signup/page";
import Admin from "../pages/admin/page";
import Saved from "../pages/saved/page";

const routes: RouteObject[] = [
  { path: "/", element: <Home /> },
  { path: "/effects", element: <Effects /> },
  { path: "/effects/docs/:docSlug", element: <Effects /> },
  { path: "/effects/:slug", element: <Effects /> },
  { path: "/saved", element: <Saved /> },
  { path: "/community", element: <Community /> },
  { path: "/submit", element: <Submit /> },
  { path: "/about", element: <About /> },
  { path: "/contact", element: <Contact /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/admin", element: <Admin /> },
  { path: "*", element: <NotFound /> },
];

export default routes;