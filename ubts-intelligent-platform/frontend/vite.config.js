import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: {
      host: "localhost",
      port: 5173,
    },
  },
  optimizeDeps: {
    include: [
      "react-big-calendar",
      "react-big-calendar/lib/addons/dragAndDrop",
    ],
  },
});