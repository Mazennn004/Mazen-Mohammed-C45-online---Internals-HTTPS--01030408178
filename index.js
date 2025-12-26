//Part1
//Q1
const fs = require("node:fs");

const readStream=fs.createReadStream('./part1.txt',{encoding:'utf-8',highWaterMark:15});
readStream.on('data',(chunck)=>{
    console.log({chunck});

})
 //Q2
const writeStream=fs.createWriteStream("dist.txt",{encoding:"utf-8",highWaterMark:15});
readStream.on('data',(chunk)=>{
    writeStream.write(chunk,(err)=>{
     if(err){
        console.log('error writing in file');
        return;
     }

    })
})
//Q3
const {createGzip}=require("zlib");
const gzip=createGzip();
const readStreamForCompresseed=fs.createReadStream('./part1.txt',{encoding:"utf-8"});
const writeStreamCompressed=fs.createWriteStream("dist.gz",{encoding:"utf-8"});
readStreamForCompresseed.pipe(gzip).pipe(writeStreamCompressed);

//Q4 CRUD API
const https = require("node:http");
function readJSONFile() {
  const users = fs.readFileSync("./users.json", { encoding: "utf-8" });

  return JSON.parse(users || "[]");
}
function writeJSONFile(data) {
  fs.writeFileSync("./users.json", JSON.stringify(data), { encoding: "utf-8" });
}

const server = https.createServer((req, res) => {
  const users = readJSONFile();
  switch (true) {
    //GET ALL USERS
    case req.method == "GET" && req.url == "/users":
      res.writeHead(200, "OK", { "content-type": "application/json" });
      res.write(JSON.stringify({ message: "success", users: users }));
      res.end();
      break;
    //CREATE NEW USER
    case req.method == "POST" && req.url == "/users":
      let body = "";
      req.on("data", (chunk) => {
        body = body + chunk;
      });

      req.on("end", () => {
        console.log("finish reading chukns!!");
        const newUser = JSON.parse(body);
        const isUserExist = users.find((user) => user.email == newUser.email);
        if (isUserExist) {
          res.writeHead(409, "Conflict", {
            "content-type": "application/json",
          });
          res.end(JSON.stringify({ message: "Account already exists" }));
          return;
        }
        newUser.id = Date.now();
        users.push(newUser);
        writeJSONFile(users);
        res.writeHead(201, "Created", { "content-type": "application/json" });
        res.write(JSON.stringify({ message: "success" }));
        res.end();
      });
      break;
    //UPDATE NEW USER
    case req.method == "PATCH" && req.url.startsWith("/users/"):
      const id = req.url.split("/")[2];
      if (id) {
        let body = "";
        req.on("data", (chunk) => {
          body = body + chunk;
        });
        req.on("end", () => {
          const parsed = JSON.parse(body);

          console.log(parsed);
          const targetUser = users.find((u) => u.id == id);
          parsed.id = targetUser?.id;
          if (targetUser) {
            const deleted = users.splice(users.indexOf(targetUser), 1, parsed);
            writeJSONFile(users);
            res.writeHead(200, "OK", { "content-type": "application/json" });
            res.write(JSON.stringify({ message: "success", user: parsed }));
            res.end();
          } else {
            res.writeHead(404, "Not found", {
              "content-type": "application/json",
            });
            res.write(JSON.stringify({ message: "id does not exist" }));
            res.end();
          }
        });
      } else {
        res.writeHead(404, "invalid url", {
          "content-type": "application/json",
        });
        res.write(JSON.stringify({ message: "id is not retrived" }));
        res.end();
      }
      break;
    //GET USER BY ID
    case req.method == "GET" && req.url.startsWith("/users/"):
      const userID = req.url.split("/")[2];

      if (userID) {
        const target = users.find((u) => u.id == userID);
        if (target) {
          res.writeHead(200, "Ok", { "content-type": "application/json" });
          res.write(JSON.stringify({ message: "success", user: target }));
          res.end();
        } else {
          res.writeHead(404, "Not found", {
            "content-type": "application/json",
          });
          res.write(JSON.stringify({ message: "id not found" }));
          res.end();
        }
      } else {
        res.writeHead(404, "Not found", { "content-type": "application/json" });
        res.write(JSON.stringify({ message: "id not retrieved" }));
        res.end();
      }
      break;
    //DELETE USER BY ID
      case req.method=="DELETE" &&  req.url.startsWith("/users/"):
      const deleteID=req.url.split('/')[2];
        if (deleteID) {
      const target=users.find((u)=>u.id==deleteID);
      if(target){
        users.splice(users.indexOf(target),1);
        writeJSONFile(users);
          res.writeHead(200, "OK", {
          "content-type": "application/json",
        });
        res.write(JSON.stringify({ message: "success" ,users:users}));
        res.end();
      } else{
        res.writeHead(404, "invalid url", {
          "content-type": "application/json",
        });
        res.write(JSON.stringify({ message: "id does not exist" }));
        res.end();
      } 
      
      } else {
        res.writeHead(404, "invalid url", {
          "content-type": "application/json",
        });
        res.write(JSON.stringify({ message: "id is not retrived" }));
        res.end();
      }

      break;
      default: //ANY OTHER URL
      res.writeHead(404, "invalid URL", { "content-type": "application/json" });
      res.end(JSON.stringify({ message: "invalid url" }));
      
  }
});
server.listen(3000, () => {
  console.log("server is running .....");
});
server.on("error", (err) => {
  console.log("Error in the server",err);
});
server.on("close", () => {
  console.log("server is closing");
});
//part3
//q1:Node.js event loop is a loop that keep checking three stacks which are the OS operations, longrunning operations and 
//timers nad executes them with a specific order

//q2:Libuv helps in executing operations that are related to the operating system such as network etc,

//q3: node js excuetes every process in the call stack but when an asynchrounous operation that occurs it does not
//get loaded in call stack it gets loaded in the event loop and the event loop classifies it in three arrays whether if its an os operation long
//running operation or timer, then the event loop keeps these three arrays if first checks the times then checks the os and the long running op 
//array thern takes a break, after that it checks for setImmediate then checks for an event if its closing, and finnaly it moves to the next process

//q4
//the call stack all the processes inside it will be exceuted immediatly if asynchronous operation finished it will be ready in the call stackk,
//the event queue is when the event is waiting to be checked by the event loop
//and the event loop is the process wehere it keeps looping aroudn the three arrays to handle executing the processes inside it

//q5
//thread pool is a number of virtual threads that can work together  if the processes has the same type , by default its 4,
//for example if i have 5 proccess that sets timers the 4 timers will execute together and the last one wil excute after them because
//the thread pool is 4, we can modify it in the terminal

//q6
//the blocking operations gets executed in the call stack (FIFO), while the non blocking (async) goes to the event queue to
//get checked by the event loop when it finishes it gets pushed to the call stack to output the result in the application
