import jwt from "jsonwebtoken";

const generateAccessToken = (user: object) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "10m",
  });
};

const generateRefreshToken = (user: object) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "2h",
  });
};

export default { generateAccessToken, generateRefreshToken };
