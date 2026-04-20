import "dotenv/config";
import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { supabase } from "./repositories/supabase.client.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/api", routes);

// Configuración de suscripción en tiempo real a "albergues"
const setupRealtimeSubscriptions = () => {
  supabase
    .channel("cambios-albergues")
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "albergues" },
      async (payload) => {
        const { id, nombre, capacidad_actual, capacidad_maxima } = payload.new;

        console.log(
          `[Realtime] Actualización en albergue: ${nombre}. Capacidad: ${capacidad_actual}/${capacidad_maxima}`,
        );

        // Regla de negocio: Emitir alerta si excede o alcanza la capacidad máxima
        if (capacidad_actual >= capacidad_maxima) {
          console.warn(
            `[ALERTA EMITIDA] El albergue "${nombre}" ha alcanzado/superado su capacidad máxima!`,
          );

          try {
            // Guardar log en la tabla alertas (silencioso, si falla solo mostramos en consola)
            await supabase.from("alertas").insert([
              {
                mensaje: `Albergue ${nombre} llenó su capacidad máxima (${capacidad_actual}/${capacidad_maxima}). ID: ${id}`,
                nivel: "critical",
              },
            ]);
          } catch (error) {
            console.error(
              "Error insertando la alerta automática:",
              error.message,
            );
          }
        }
      },
    )
    .subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(
          "[Realtime] Suscrito exitosamente a cambios en la tabla albergues",
        );
      }
    });
};

setupRealtimeSubscriptions();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Servidor de SIMTR Backend corriendo en http://localhost:${PORT}`,
  );
});
