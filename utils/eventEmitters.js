// const EventEmitter = require("events");
// const oracledb = require("oracledb");
// const poll = require("../db/pool");
// class OracleEventEmitter extends EventEmitter {
//   constructor() {
//     super();
//     this.connection = null;
//   }

//   async connect() {
//     try {
//       this.connection = await oracledb.getConnection(poll);
//       this.emit("connected");
//     } catch (error) {
//       this.emit("error", error);
//     }
//   }

//   async executeQuery(sql) {
//     try {
//       this.connection = await oracledb.getConnection(poll);
//       const result = await this.connection.execute(sql);
//       this.emit("queryResult", result);
//     } catch (error) {
//       this.emit("error", error);
//     }
//   }

//   async disconnect() {
//     try {
//       await this.connection.close();
//       this.emit("disconnected");
//     } catch (error) {
//       this.emit("error", error);
//     }
//   }
// }

// module.exports = OracleEventEmitter;
