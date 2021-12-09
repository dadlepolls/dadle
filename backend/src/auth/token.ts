import jwt, { JsonWebTokenError } from "jsonwebtoken";
import * as fs from "fs";
import { RequestHandler } from "express";

/**
 * hint:
 * openssl genrsa -out secrets/tokens.key 2048
 * openssl rsa -in secrets/tokens.key -pubout -out secrets/tokens.pub
 */
const privKey = fs.readFileSync("./secrets/tokens.key");
const pubKey = fs.readFileSync("./secrets/tokens.pub");

const issueToken = (userId: string) => {
  return jwt.sign({}, privKey, {
    algorithm: "RS256",
    subject: userId,
    expiresIn: "1h",
    issuer: "DadleX-Backend",
    audience: "graph",
  });
};

const verifyToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, pubKey, {
    algorithms: ["RS256"],
    audience: "graph",
  }) as jwt.JwtPayload;
};

const parseTokenMiddleware: RequestHandler = (req, res, next) => {
  const providedToken = req.get("authorization")
    ? String(req.get("authorization")).replace("Bearer ", "")
    : undefined;

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
