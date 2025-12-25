export type TicketStatus = "open" | "in_progress" | "resolved";

export type Ticket = {
  _id: string;                
  title: string;
  description: string;
  status: TicketStatus;
  priority: 1 | 2 | 3 | 4 | 5;
  createdAt: string;            
  updatedAt: string;           
  assignee?: string;
};