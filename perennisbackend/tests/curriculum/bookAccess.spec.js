import { checkPageAccess } from "../../src/lib/reading/reflectionGateService.js";
import { seedBookWithGate } from "../seeders/bookseeder.js";

describe("D11 — Book curriculum access", () => {

  test("blocks page beyond reflection gate", async () => {
    const { userId, bookId } = await seedBookWithGate({
      gatePage: 10,
    });

    const access = await checkPageAccess({
      userId,
      bookId,
      pageNumber: 11,
    });

    expect(access.allowed).toBe(false);
    expect(access.gate).not.toBeNull();
    expect(access.gate.pageNumber).toBe(10);
  });

  test("allows page before reflection gate", async () => {
    const { userId, bookId } = await seedBookWithGate({
      gatePage: 10,
    });

    const access = await checkPageAccess({
      userId,
      bookId,
      pageNumber: 9,
    });

    expect(access.allowed).toBe(true);
  });

  test("returns CURRICULUM_LOCKED if wrong gate order", async () => {
    const { userId, bookId } = await seedBookWithGate({
      gatePage: 5,
    });

    const access = await checkPageAccess({
      userId,
      bookId,
      pageNumber: 6,
    });

    expect(access.allowed).toBe(false);
    expect(access.reason).toBeDefined();
  });

});
