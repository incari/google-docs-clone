const mongoose = require("mongoose");
const Document = require("./Document");
const cors = require("cors")

const express = require("express");
const app = express();
const server = require("http").createServer(app);

/* const { Server } = require("socket.io");
const io = new Server(server);
 */

app.use(express.static(__dirname+'../build'))

 const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
}); 

const PORT = 3001

 server.listen(PORT, () => {
  console.log("connected to port:"+ PORT);
}); 

mongoose.connect(
  "mongodb+srv://incari:INfBFdMvo9JdWrJW@cluster0.uvpq5.mongodb.net/docsclone?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  }
);

const defaultValue = "";

io.on("connection", (socket) => {
  console.log("New Client connected");
  socket.on("get-document", async (documentId) => {
    const document = await findOrCreateDocument(documentId);
    socket.join(documentId);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (delta) => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(documentId, { data });
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}
