const express = require("express");
const functions = require("firebase-functions");

const app = require("../server/server.js");

const appOuter = express();

appOuter.use("*", (req, res, next) => {
    console.log(`Request received by functions: ${req.method} ${req.url}`);
    next();
});

appOuter.use("/api", app);

exports.app = functions.https.onRequest(appOuter);