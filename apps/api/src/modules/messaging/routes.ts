import type { FastifyInstance } from "fastify";
import { eq, and, desc, count, lt } from "drizzle-orm";
import { db, schema } from "@edusync/db";
import { createConversationSchema, sendMessageSchema, messageListQuerySchema } from "@edusync/validators";
import { uuidParamSchema } from "@edusync/validators";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/auth";
import { sendSuccess, sendPaginated } from "../../utils/response";
import { NotFoundError, ForbiddenError } from "../../utils/errors";

export async function messagingRoutes(app: FastifyInstance): Promise<void> {
  app.addHook("preHandler", authenticate);

  // ─── GET /messages/conversations (kullanıcının sohbetleri) ───
  app.get("/conversations", async (request, reply) => {
    const userId = request.user!.userId;

    const participations = await db.query.conversationParticipants.findMany({
      where: eq(schema.conversationParticipants.userId, userId),
      with: {
        conversation: {
          with: {
            participants: {
              with: {
                user: { columns: { id: true, firstName: true, lastName: true, avatar: true, role: true } },
              },
            },
            messages: {
              orderBy: [desc(schema.messages.createdAt)],
              limit: 1,
              columns: { id: true, content: true, type: true, createdAt: true, senderId: true },
            },
          },
        },
      },
    });

    const conversations = participations
      .map(p => ({
        ...p.conversation,
        lastReadAt: p.lastReadAt,
        otherParticipants: p.conversation.participants.filter(pp => pp.userId !== userId),
        lastMessage: p.conversation.messages[0] || null,
      }))
      .sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || a.createdAt;
        const bTime = b.lastMessage?.createdAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });

    sendSuccess(reply, conversations);
  });

  // ─── POST /messages/conversations (yeni sohbet başlat) ───
  app.post("/conversations", {
    preHandler: [validate({ body: createConversationSchema })],
  }, async (request, reply) => {
    const { participantId, type, title } = (request as any).validatedBody;
    const userId = request.user!.userId;
    const tenantId = request.user!.tenantId;
    if (!tenantId) throw new ForbiddenError();

    // Mevcut direkt sohbet var mı kontrol et
    if (type === "DIRECT") {
      const existing = await db.execute<any>(
        `SELECT cp1.conversation_id FROM edusync.conversation_participants cp1
         JOIN edusync.conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
         JOIN edusync.conversations c ON c.id = cp1.conversation_id
         WHERE cp1.user_id = '${userId}' AND cp2.user_id = '${participantId}' AND c.type = 'DIRECT'
         LIMIT 1`
      );

      if (existing.length > 0) {
        const conv = await db.query.conversations.findFirst({
          where: eq(schema.conversations.id, existing[0].conversation_id),
          with: { participants: { with: { user: { columns: { id: true, firstName: true, lastName: true, avatar: true } } } } },
        });
        return sendSuccess(reply, conv);
      }
    }

    // Yeni sohbet oluştur
    const [conversation] = await db.insert(schema.conversations).values({
      tenantId,
      type,
      title,
    }).returning();

    // Katılımcıları ekle
    await db.insert(schema.conversationParticipants).values([
      { conversationId: conversation.id, userId },
      { conversationId: conversation.id, userId: participantId },
    ]);

    const result = await db.query.conversations.findFirst({
      where: eq(schema.conversations.id, conversation.id),
      with: { participants: { with: { user: { columns: { id: true, firstName: true, lastName: true, avatar: true } } } } },
    });

    sendSuccess(reply, result, 201);
  });

  // ─── GET /messages/conversations/:id/messages ───
  app.get("/conversations/:id/messages", {
    preHandler: [validate({ params: uuidParamSchema, query: messageListQuerySchema })],
  }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const query = (request as any).validatedQuery;
    const userId = request.user!.userId;

    // Kullanıcı bu sohbete dahil mi?
    const participant = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(schema.conversationParticipants.conversationId, id),
        eq(schema.conversationParticipants.userId, userId),
      ),
    });
    if (!participant) throw new ForbiddenError("Bu sohbete erişim yetkiniz yok");

    const conditions: any[] = [eq(schema.messages.conversationId, id)];
    if (query.before) conditions.push(lt(schema.messages.createdAt, new Date(query.before)));

    const [{ total }] = await db.select({ total: count() }).from(schema.messages)
      .where(and(...conditions));

    const offset = (query.page - 1) * query.pageSize;
    const messagesList = await db.query.messages.findMany({
      where: and(...conditions),
      with: { sender: { columns: { id: true, firstName: true, lastName: true, avatar: true } } },
      orderBy: [desc(schema.messages.createdAt)],
      limit: query.pageSize,
      offset,
    });

    // Son okunma zamanını güncelle
    await db.update(schema.conversationParticipants).set({ lastReadAt: new Date() })
      .where(and(
        eq(schema.conversationParticipants.conversationId, id),
        eq(schema.conversationParticipants.userId, userId),
      ));

    sendPaginated(reply, messagesList, total, query.page, query.pageSize);
  });

  // ─── POST /messages/conversations/:id/messages ───
  app.post("/conversations/:id/messages", {
    preHandler: [validate({ params: uuidParamSchema, body: sendMessageSchema })],
  }, async (request, reply) => {
    const { id } = (request as any).validatedParams;
    const { content, type, metadata } = (request as any).validatedBody;
    const userId = request.user!.userId;

    // Kullanıcı bu sohbete dahil mi?
    const participant = await db.query.conversationParticipants.findFirst({
      where: and(
        eq(schema.conversationParticipants.conversationId, id),
        eq(schema.conversationParticipants.userId, userId),
      ),
    });
    if (!participant) throw new ForbiddenError("Bu sohbete erişim yetkiniz yok");

    const [message] = await db.insert(schema.messages).values({
      conversationId: id,
      senderId: userId,
      content,
      type,
      metadata,
    }).returning();

    // Sohbetin lastMessageAt'ini güncelle
    await db.update(schema.conversations).set({ lastMessageAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.conversations.id, id));

    const messageWithSender = await db.query.messages.findFirst({
      where: eq(schema.messages.id, message.id),
      with: { sender: { columns: { id: true, firstName: true, lastName: true, avatar: true } } },
    });

    sendSuccess(reply, messageWithSender, 201);
  });
}
