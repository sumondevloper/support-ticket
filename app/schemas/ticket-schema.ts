import { z } from "zod";

const baseTicketSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title must be at least 5 characters long" })
    .max(80, { message: "Title cannot exceed 80 characters" }),

  description: z
    .string()
    .optional()
    .default(""),

  status: z.enum(["open", "in_progress", "resolved","close"], {
    message: "Status must be one of: open, in_progress, resolved",
  }),

  priority: z
    .number()
    .int({ message: "Priority must be an integer" })
    .min(1, { message: "Priority must be at least 1" })
    .max(5, { message: "Priority cannot exceed 5" }),

  assignee: z
    .string()
    .optional()          
    .nullable()          
    .transform((val) => (val === "" ? null : val)) 
    .default(null),
});

export const createTicketSchema = baseTicketSchema;

export const updateTicketSchema = baseTicketSchema.partial({
}).extend({
  assignee: z
    .string()
    .optional()
    .nullable()
    .default(null),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;