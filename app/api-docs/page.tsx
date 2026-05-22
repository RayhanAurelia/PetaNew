import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Documentation — PETA",
  description: "Interactive API documentation",
};

const swaggerHtml = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>PETA — API Documentation</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css">
  <style>body { margin: 0; background: #fafafa; } .topbar { display: none; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: "/api/docs",
        dom_id: "#swagger-ui",
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
        plugins: [SwaggerUIBundle.plugins.DownloadUrl],
        layout: "StandaloneLayout",
        withCredentials: true,
        requestInterceptor: (req) => { req.credentials = "include"; return req; }
      });
    };
  </script>
</body>
</html>
`;

export default function ApiDocsPage() {
  return (
    <iframe
      srcDoc={swaggerHtml}
      style={{ width: "100%", height: "100vh", border: "none" }}
      title="API Documentation"
    />
  );
}
