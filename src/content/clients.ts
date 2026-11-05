export interface Client {
  /** Key of the client's texts in `messages.clients.items`. */
  key: string;
  /** Fictional case: never publish to production while any client has it. */
  example: boolean;
}

export const CLIENTS: Client[] = [
  { key: "frotaAgil", example: true },
  { key: "odontoLume", example: true },
  { key: "emporioVilaNova", example: true },
  { key: "baseFirme", example: true },
];

export const HAS_EXAMPLE_CLIENTS = CLIENTS.some((client) => client.example);
