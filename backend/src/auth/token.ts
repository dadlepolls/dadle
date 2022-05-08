import jwt, { JsonWebTokenError } from "jsonwebtoken";
import * as fs from "fs";
import { RequestHandler } from "express";
import logger from "../log";

/**
 * hint:
 * openssl genrsa -out secrets/tokens.key 2048
 * openssl rsa -in secrets/tokens.key -pubout -out secrets/tokens.pub
 */
let privKey: Buffer, pubKey: Buffer;
try {
  privKey = fs.readFileSync("./secrets/tokens.key");
  pubKey = fs.readFileSync("./secrets/tokens.pub");
} catch (_) {
  logger.error("Fatal: Private and Public Keys for tokens could not be found");
}

const issueToken = (
  userId: string,
  options: { claims: string[]; expiresIn: string | number } = {
    claims: ["frontend"],
    expiresIn: "1h",
  }
) => {
  if (!privKey) throw new Error("Private key does not exist");
  return jwt.sign({}, privKey, {
    algorithm: "RS256",
    subject: userId,
    expiresIn: options.expiresIn,
    issuer: "Dadle-Backend",
    audience: options.claims,
  });
};

const verifyToken = (
  token: string,
  options: { claims: string[] } = { claims: ["frontend"] }
): jwt.JwtPayload => {
  if (!pubKey) throw new Error("Public key does not exist");
  return jwt.verify(token, pubKey, {
    algorithms: ["RS256"],
    audience: options.claims,
  }) as jwt.JwtPayload;
};

const parseTokenMiddleware: RequestHandler = (req, res, next) => {
  let providedToken: string | undefined;
  if (req.query.token) providedToken = String(req.query.token);
  if (req.get("authorization"))
    providedToken = String(req.get("authorization")).replace("Bearer ", "");

  if (providedToken) {
    try {
      const parsedToken = verifyToken(providedToken);
      req.user = { _id: parsedToken.sub };
    } catch (err) {
      let errMsg = "";
      if (err instanceof JsonWebTokenError) {
        errMsg = err.message;
      }

      return res.status(401).json({
        data: null,
        errors: [
          {
            message: `Token validation failed, is it expired? ${errMsg}`,
            extensions: { code: "TOKEN_INVALID" },
          },
        ],
      });
    }
  }

  return next();
};

export { issueToken, verifyToken, parseTokenMiddleware };
