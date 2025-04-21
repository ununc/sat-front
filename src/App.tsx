import { RouterProvider } from "react-router-dom";
import { RouterDom } from "./routers/RouterDom";
import "./App.css";

export function App() {
  return <RouterProvider router={RouterDom} />;
}
