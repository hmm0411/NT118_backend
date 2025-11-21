// import swaggerJsdoc from "swagger-jsdoc";
// import swaggerUi from "swagger-ui-express";
// import { Express } from "express";
// import path from "path";

// export const setupSwagger = (app: Express) => {
//   const options = {
//     definition: {
//       openapi: "3.0.0",
//       info: {
//         title: "🎬 Ciné API",
//         version: "1.0.0",
//         description: "API cho hệ thống đặt vé phim (Node.js + Firestore)",
//         contact: {
//           name: "Ciné Backend Dev Team",
//           email: "nhloc08@gmail.com",
//         },
//       },
//       servers: [
//         {
//           url: "http://localhost:5000",
//           description: "Local server",
//         },
//       ],
//       components: {
//         securitySchemes: {
//           bearerAuth: {
//             type: "http",
//             scheme: "bearer",
//             bearerFormat: "JWT",
//           },
//         },
//       },
//       security: [
//         {
//           bearerAuth: [],
//         },
//       ],
//     },
//     // Dùng path.resolve để đảm bảo swagger-jsdoc tìm đúng các file
//     apis: [path.resolve(__dirname, "../modules/**/*.ts")],
//   };

//   const specs = swaggerJsdoc(options);

//   app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs, {
//     explorer: true,
//     customCss: ".swagger-ui .topbar { display: none }",
//     customSiteTitle: "Ciné API Docs",
//   }));

//   console.log("📘 Swagger Docs available at: http://localhost:5000/api/docs");
// };
