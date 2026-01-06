// src/lib/audit/adminAudit.js
import prisma from "../prisma.js";

export async function logAdminAction({
  adminId,
  action,
  entityType,
  entityId,
  payload,
}) {
  await prisma.adminAudit.create({
    data: {
      adminId,
      action,
      entityType,
      entityId,
      payload,
    },
  });
}
