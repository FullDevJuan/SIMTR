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

describe("Módulo de Damnificados y Albergues", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar autenticación simulada por defecto (Admin User)
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "auth-admin-uuid", email: "admin@simtr.com" } },
      error: null,
    });
  });

  describe("CP-04: POST /damnificados - registro exitoso", () => {
    it("debe registrar exitosamente un damnificado con documento único y retornar HTTP 201", async () => {
      const mockDamnificado = {
        id: "damnificado-123-uuid",
        numero_documento: "1002938475",
        tipo_documento: "cedula_ciudadania",
        nombres: "Juan Carlos",
        apellidos: "Perez Gomez",
        genero: "masculino",
        barrio_afectado: "El Prado",
        estado_actual: "sin_ubicacion",
        total_miembros: 3,
        activo: true,
      };

      // Mock para validar rol de administrador y inserción del damnificado
      mockSupabase.from.mockImplementation((table) => {
        if (table === "usuarios") {
          return makeQueryMock({ id: "user-admin-uuid", rol: "ADMIN" });
        }
        if (table === "damnificados") {
          return makeQueryMock([mockDamnificado]);
        }
        return makeQueryMock([]);
      });

      const response = await request(app)
        .post("/api/damnificados")
        .set("Authorization", "Bearer mock-admin-token")
        .send({
          numero_documento: "1002938475",
          tipo_documento: "cedula_ciudadania",
          nombres: "Juan Carlos",
          apellidos: "Perez Gomez",
          genero: "masculino",
          barrio_afectado: "El Prado",
          estado_actual: "sin_ubicacion",
          total_miembros: 3,
          activo: true,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id", "damnificado-123-uuid");
      expect(response.body.numero_documento).toBe("1002938475");
    });
  });

  describe("CP-05: POST /damnificados - documento duplicado", () => {
    it("debe retornar error 500 al intentar registrar un documento que ya existe", async () => {
      // Mock para validar rol e inserción con error de base de datos
      mockSupabase.from.mockImplementation((table) => {
        if (table === "usuarios") {
          return makeQueryMock({ id: "user-admin-uuid", rol: "ADMIN" });
        }
        if (table === "damnificados") {
          return makeQueryMock(null, { message: "duplicate key value violates unique constraint" });
        }
        return makeQueryMock([]);
      });

      const response = await request(app)
        .post("/api/damnificados")
        .set("Authorization", "Bearer mock-admin-token")
        .send({
          numero_documento: "1002938475",
          tipo_documento: "cedula_ciudadania",
          nombres: "Juan Carlos",
          apellidos: "Perez Gomez",
          genero: "masculino",
          barrio_afectado: "El Prado",
          estado_actual: "sin_ubicacion",
          total_miembros: 3,
          activo: true,
        });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toContain("duplicate key");
    });
  });
});
