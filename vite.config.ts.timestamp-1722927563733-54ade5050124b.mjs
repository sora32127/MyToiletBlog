// vite.config.ts
import { defineConfig } from "file:///home/sora32127/MyToiletBlog/node_modules/vite/dist/node/index.js";
import {
  vitePlugin as remix,
  cloudflareDevProxyVitePlugin
} from "file:///home/sora32127/MyToiletBlog/node_modules/@remix-run/dev/dist/index.js";
import tsconfigPaths from "file:///home/sora32127/MyToiletBlog/node_modules/vite-tsconfig-paths/dist/index.mjs";
import mdx from "file:///home/sora32127/MyToiletBlog/node_modules/@mdx-js/rollup/index.js";
var vite_config_default = defineConfig({
  plugins: [
    mdx(),
    cloudflareDevProxyVitePlugin(),
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true
      }
    }),
    tsconfigPaths()
  ],
  ssr: {
    resolve: {
      conditions: ["workerd", "worker", "browser"]
    }
  },
  resolve: {
    mainFields: ["browser", "module", "main"]
  },
  build: {
    minify: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9zb3JhMzIxMjcvTXlUb2lsZXRCbG9nXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9zb3JhMzIxMjcvTXlUb2lsZXRCbG9nL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3NvcmEzMjEyNy9NeVRvaWxldEJsb2cvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHtcbiAgdml0ZVBsdWdpbiBhcyByZW1peCxcbiAgY2xvdWRmbGFyZURldlByb3h5Vml0ZVBsdWdpbixcbn0gZnJvbSBcIkByZW1peC1ydW4vZGV2XCI7XG5pbXBvcnQgdHNjb25maWdQYXRocyBmcm9tIFwidml0ZS10c2NvbmZpZy1wYXRoc1wiO1xuaW1wb3J0IG1keCBmcm9tICdAbWR4LWpzL3JvbGx1cCdcblxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbXG4gICAgbWR4KCksXG4gICAgY2xvdWRmbGFyZURldlByb3h5Vml0ZVBsdWdpbigpLFxuICAgIHJlbWl4KHtcbiAgICAgIGZ1dHVyZToge1xuICAgICAgICB2M19mZXRjaGVyUGVyc2lzdDogdHJ1ZSxcbiAgICAgICAgdjNfcmVsYXRpdmVTcGxhdFBhdGg6IHRydWUsXG4gICAgICAgIHYzX3Rocm93QWJvcnRSZWFzb246IHRydWUsXG4gICAgICB9LFxuICAgIH0pLFxuICAgIHRzY29uZmlnUGF0aHMoKSxcbiAgXSxcbiAgc3NyOiB7XG4gICAgcmVzb2x2ZToge1xuICAgICAgY29uZGl0aW9uczogW1wid29ya2VyZFwiLCBcIndvcmtlclwiLCBcImJyb3dzZXJcIl0sXG4gICAgfSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIG1haW5GaWVsZHM6IFtcImJyb3dzZXJcIiwgXCJtb2R1bGVcIiwgXCJtYWluXCJdLFxuICB9LFxuICBidWlsZDoge1xuICAgIG1pbmlmeTogdHJ1ZSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFzUSxTQUFTLG9CQUFvQjtBQUNuUztBQUFBLEVBQ0UsY0FBYztBQUFBLEVBQ2Q7QUFBQSxPQUNLO0FBQ1AsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxTQUFTO0FBR2hCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxJQUNKLDZCQUE2QjtBQUFBLElBQzdCLE1BQU07QUFBQSxNQUNKLFFBQVE7QUFBQSxRQUNOLG1CQUFtQjtBQUFBLFFBQ25CLHNCQUFzQjtBQUFBLFFBQ3RCLHFCQUFxQjtBQUFBLE1BQ3ZCO0FBQUEsSUFDRixDQUFDO0FBQUEsSUFDRCxjQUFjO0FBQUEsRUFDaEI7QUFBQSxFQUNBLEtBQUs7QUFBQSxJQUNILFNBQVM7QUFBQSxNQUNQLFlBQVksQ0FBQyxXQUFXLFVBQVUsU0FBUztBQUFBLElBQzdDO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsWUFBWSxDQUFDLFdBQVcsVUFBVSxNQUFNO0FBQUEsRUFDMUM7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxFQUNWO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
