const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  console.log(err.stack);
  if (err instanceof ErrorResponse) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path} : ${err.value}`,
    });
  }

  if (err.code === 11000) {
    const key = Object.keys(err.keyValue);
    const value = Object.values(err.keyValue);
    return res.status(400).json({
      success: false,
      message: `Already exists ${key}:${value}`,
    });
  }

  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res
      .status(err.status)
      .json({ status: "failed", message: "Invalid input JSON format" });
  }

  res.status(500).json({
    status: "error",
    message: "Server Error",
  });
};

module.exports = errorHandler;
