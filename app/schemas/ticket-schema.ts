// schemas/ticket-schema.ts
import { z } from "zod";

export const createTicketSchema = z.object({
  title: z.string().min(5, "Minimum 5 characters").max(80, "Maximum 80 characters"),
  description: z.string().optional().default(''), // Optional with empty default
  status: z.enum(["open", "in_progress", "resolved"]),
  priority: z.number().min(1).max(5),
  assignee: z.string().min(2).optional(),
});

export const updateTicketSchema = createTicketSchema.partial().extend({
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  priority: z.number().min(1).max(5).optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;