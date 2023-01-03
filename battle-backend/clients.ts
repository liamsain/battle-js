import WebSocket from "ws";

export interface IClient {
  socket: WebSocket.WebSocket;
  userId: string;
}

export function useClients() {
  let clients: { socket: WebSocket.WebSocket; userId: string }[] = [];
  function addClient(client: IClient) {
    /* 
      If client exists, just remove and readd 
      as we might need to refresh the socket obj
      ...not sure if we need this
    */ 
    removeClient(client.userId);
    clients.push(client);

  }
  function sendMessageToClients(msg: {type: string, data: any}){
    clients.forEach((c) => {
      c.socket.send(
        JSON.stringify(msg)
      );
    });
  }
  function removeClient(userId: string) {
    clients = clients.filter((c) => c.userId !== userId);
  }
  return {
    addClient,
    sendMessageToClients,
    removeClient
  }
}
