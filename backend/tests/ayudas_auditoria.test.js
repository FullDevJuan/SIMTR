import { jest } from "@jest/globals";

// Mock Supabase client using ESM-compliant mock module
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(),
  channel: jest.fn().mockImplementation(() => ({
    on: jest.fn().mockReturnThis(),
    subscribe: jest.fn().mockReturnThis(),
  })),
};

jest.unstable_mockModule("../repositories/supabase.client.js", () => ({
  supabase: mockSupabase,
}));

jest.unstable_mockModule("../utils/audit.logger.js", () => ({
  logAudit: jest.fn().mockResolvedValue(true),
}));

// Dynamic import of app and supertest after mocks are declared
const { default: app } = await import("../app.js");
const { default: request } = await import("supertest");

// Helper to construct mock query chain
const makeQueryMock = (resolveValue, rejectError = null) => {
  const query = {};
  const methods = [
    "select",
    "insert",
    "update",
    "delete",
    "eq",
    "single",
    "limit",
    "order",
  ];
  methods.forEach((method) => {
    query[method] = jest.fn().mockImplementation(() => query);
  });

  query.then = (onFulfilled) => {
    if (rejectError) {
      return Promise.resolve(onFulfilled({ data: null, error: rejectError }));
    }
    return Promise.resolve(onFulfilled({ data: resolveValue, error: null }));
  };

  return query;
};

describe("Módulo de Ayudas Humanitarias y Auditoría", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar autenticación simulada por defecto (Admin User)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "auth-admin-uuid", email: "admin@simtr.com" } },
      error: null,
    });
  });

  describe("CP-09: POST /entregas_ayuda - registro exitoso", () => {
    it("debe registrar una entrega de ayuda con damnificado y tipo de ayuda existentes y retornar HTTP 201", async () => {
      const mockEntrega = {
        id: "entrega-ayuda-uuid",
        damnificado_id: "damnificado-123-uuid",
        tipo_ayuda_id: "tipo-ayuda-456-uuid",
        cantidad: 10,
        fuente_recurso: "alcaldia",
        estado: "entregada",
        fecha_entrega: new Date().toISOString(),
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === "usuarios") {
          return makeQueryMock({ id: "user-admin-uuid", rol: "ADMIN" });
        }
        if (table === "entregas_ayuda") {
          return makeQueryMock([mockEntrega]);
        }
        return makeQueryMock([]);
      });

      const response = await request(app)
        .post("/api/entregas_ayuda")
        .set("Authorization", "Bearer mock-admin-token")
        .send({
          damnificado_id: "damnificado-123-uuid",
          tipo_ayuda_id: "tipo-ayuda-456-uuid",
          cantidad: 10,
          fuente_recurso: "alcaldia",
          estado: "entregada",
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id", "entrega-ayuda-uuid");
      expect(response.body.cantidad).toBe(10);
    });
  });

  describe("CP-10: PATCH /entregas_ayuda/:id - anulación", () => {
    it("debe anular una entrega de ayuda y cambiar su estado a 'anulada' retornando HTTP 200", async () => {
      const mockEntregaAnulada = {
        id: "entrega-ayuda-uuid",
        damnificado_id: "damnificado-123-uuid",
        tipo_ayuda_id: "tipo-ayuda-456-uuid",
        cantidad: 10,
        fuente_recurso: "alcaldia",
        estado: "anulada",
        motivo_anulacion: "Error de digitación",
        fecha_entrega: new Date().toISOString(),
      };

      mockSupabase.from.mockImplementation((table) => {
        if (table === "usuarios") {
          return makeQueryMock({ id: "user-admin-uuid", rol: "ADMIN" });
        }
        if (table === "entregas_ayuda") {
          return makeQueryMock([mockEntregaAnulada]);
        }
        return makeQueryMock([]);
      });

      const response = await request(app)
        .patch("/api/entregas_ayuda/entrega-ayuda-uuid")
        .set("Authorization", "Bearer mock-admin-token")
        .send({
          estado: "anulada",
          motivo_anulacion: "Error de digitación",
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("estado", "anulada");
      expect(response.body.motivo_anulacion).toBe("Error de digitación");
    });
  });

  describe("CP-11: GET /audit - filtrado por tabla damnificados", () => {
    it("debe retornar HTTP 200 y al menos un registro de auditoría con los campos clave para la tabla damnificados", async () => {
      const mockAuditLog = [
        {
          id: "audit-log-uuid",
          tabla_afectada: "damnificados",
          operacion: "UPDATE",
          valor_anterior: { total_miembros: 2 },
          valor_nuevo: { total_miembros: 3 },
          created_at: new Date().toISOString(),
          ip_origen: "127.0.0.1",
        },
      ];

      mockSupabase.from.mockImplementation((table) => {
        if (table === "usuarios") {
          return makeQueryMock({ id: "user-admin-uuid", rol: "ADMIN" });
        }
        if (table === "audit_log") {
          return makeQueryMock(mockAuditLog);
        }
        return makeQueryMock([]);
      });

      const response = await request(app)
        .get("/api/audit?tabla_afectada=damnificados")
        .set("Authorization", "Bearer mock-admin-token");

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);

      const log = response.body[0];
      expect(log).toHaveProperty("tabla_afectada", "damnificados");
      expect(log).toHaveProperty("operacion", "UPDATE");
      expect(log).toHaveProperty("valor_anterior");
      expect(log).toHaveProperty("valor_nuevo");
    });
  });
});
