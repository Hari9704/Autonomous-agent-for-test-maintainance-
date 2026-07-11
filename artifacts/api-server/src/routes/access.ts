import { Router, type IRouter } from "express";
import {
  PurchaseAccessBody,
  PurchaseAccessResponse,
  ClassifySampleBody,
  ClassifySampleResponse,
} from "@workspace/api-zod";
import { createApiKey, findApiKey } from "../lib/apiKeys";
import { classifyFailure } from "../lib/classifier";

const router: IRouter = Router();

// Simulated one-time $5 checkout. No real payment processor is involved —
// the "purchase" instantly succeeds and issues an API key. This mirrors the
// reference system's philosophy of simulated adapters that can later be
// swapped for a real processor (e.g. Stripe) without touching call sites.
router.post("/access/purchase", async (req, res, next): Promise<void> => {
  try {
    const parsed = PurchaseAccessBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const { email, plan } = parsed.data;
    const amountCents = 500;

    const row = await createApiKey(email, plan ?? "mcp_access", amountCents);
    req.log.info({ email, plan: row.plan }, "Issued MCP access key (mock checkout)");

    res.status(201).json(
      PurchaseAccessResponse.parse({
        id: row.id,
        email: row.email,
        apiKey: row.key,
        plan: row.plan,
        amountCents: row.amountCents,
        createdAt: row.createdAt,
      }),
    );
  } catch (err) {
    next(err);
  }
});

router.post("/access/classify", async (req, res, next): Promise<void> => {
  try {
    const apiKey = req.header("x-api-key");
    if (!apiKey) {
      res.status(401).json({ error: "Missing x-api-key header. Get one from /get-mcp." });
      return;
    }

    const record = await findApiKey(apiKey);
    if (!record) {
      res.status(401).json({ error: "Invalid API key." });
      return;
    }

    const parsed = ClassifySampleBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const result = classifyFailure(parsed.data.errorMessage);
    res.json(ClassifySampleResponse.parse(result));
  } catch (err) {
    next(err);
  }
});

export default router;
