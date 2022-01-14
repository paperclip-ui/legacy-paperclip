type Message = any;

export interface Connection {
  onMessage(listener: (message: Message) => void): () => void;
  send(message: Message): void;
  onDisconnect(listener: () => void): void;
}
