import { createAutomation, deleteAutomation, getAllAutomationsForAdmin, getAutomationById, getAutomationsByUser, toggleAutomation, updateAutomation, type AutomationRecord } from "@/backend/repositories/automation.repository";
import { automationInputSchema } from "@/backend/validators/automation-validator";

function unwrapRelation<T>(value: T | T[] | null | undefined) {
  return Array.isArray(value) ? (value[0] ?? null) : (value ?? null);
}

function isAutomationStale(automation: AutomationRecord) {
  const pageMissing = !automation.facebook_pages;
  const postMissing = !automation.facebook_posts;
  const pageDisconnected = automation.facebook_pages?.status === "disconnected";
  const postStale = automation.facebook_posts?.is_stale === true;

  return pageMissing || postMissing || pageDisconnected || postStale;
}

function normalizeAutomation(automation: AutomationRecord) {
  return {
    ...automation,
    facebook_pages: unwrapRelation(automation.facebook_pages),
    facebook_posts: unwrapRelation(automation.facebook_posts),
    is_stale: isAutomationStale(automation)
  };
}

export async function createAutomationRecord(userId: string, input: unknown) {
  const validated = automationInputSchema.parse(input);
  return createAutomation({ ...validated, user_id: userId });
}

export async function getAutomationRecord(userId: string, id: string) {
  const automation = await getAutomationById(id, userId);
  if (!automation) throw new Error("Automation not found");
  return normalizeAutomation(automation);
}

export async function getUserAutomations(userId: string) {
  const automations = await getAutomationsByUser(userId);
  return automations.map(normalizeAutomation);
}

export async function updateAutomationRecord(userId: string, id: string, input: unknown) {
  await getAutomationRecord(userId, id);
  const validated = automationInputSchema.parse(input);
  return updateAutomation(id, userId, validated);
}

export async function deleteAutomationRecord(userId: string, id: string) {
  await getAutomationRecord(userId, id);
  return deleteAutomation(id, userId);
}

export async function toggleAutomationRecord(userId: string, id: string) {
  const automation = await getAutomationRecord(userId, id);
  if (automation && automation.is_stale) {
    throw new Error("Cannot activate automation with missing or stale page/post");
  }
  return toggleAutomation(id, userId);
}

export async function getAdminAutomations() {
  return getAllAutomationsForAdmin();
}
