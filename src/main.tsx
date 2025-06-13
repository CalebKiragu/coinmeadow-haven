import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Buffer } from "buffer";
import process from "process";

if (!window.Buffer) window.Buffer = Buffer;
if (!window.process) window.process = process;

createRoot(document.getElementById("root")!).render(<App />);
