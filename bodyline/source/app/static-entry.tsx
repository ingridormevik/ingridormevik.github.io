import { createRoot } from "react-dom/client";
import BodylineGame from "./bodyline-game";
import "./globals.css";

createRoot(document.getElementById("root")!).render(<BodylineGame assetBase="./" />);
