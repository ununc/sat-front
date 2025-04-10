import { RouterProvider } from "react-router-dom";
import { router } from "./routers/router";
import "./App.css";

export function App() {
  return <RouterProvider router={router} />;
}
