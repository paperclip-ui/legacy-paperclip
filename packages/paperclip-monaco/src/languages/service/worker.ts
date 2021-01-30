console.log("START");

const init = () => {
  const channel = new BroadcastChannel("paperclip");

  console.log("INIT WORKER");
  self.addEventListener("message", () => {
    console.log("MESSS");
  });
  channel.onmessage = (event) => {
    console.log(event.data);
  }
};

init();