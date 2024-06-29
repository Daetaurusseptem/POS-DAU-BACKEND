"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generarJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generarJWT = (uid) => {
    return new Promise((resolve, reject) => {
        const payload = {
            uid
        };
        jsonwebtoken_1.default.sign(payload, process.env.JWT, {
            expiresIn: '24h'
        }, (err, token) => {
            if (err) {
                reject('could not generate JWT');
            }
            else {
                resolve(token);
            }
        });
    });
};
exports.generarJWT = generarJWT;
