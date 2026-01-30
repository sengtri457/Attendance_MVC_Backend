var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
const cors = require("cors");
const helmet = require("helmet");
const routes = require("./routes");
const app = express();
const PORT = process.env.PORT || 3001;


// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true
}),);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
// Request logging middleware (development only)
if (process.env.NODE_ENV === "development") {
    app.use((req, res, next) => {
        console.log(`${
            new Date().toISOString()
        } - ${
            req.method
        } ${
            req.path
        }`);
        next();
    });
}

// Health check endpoint
app.get("/health", (req, res) => {
    res.status(200).json({success: true, message: "Server is running", timestamp: new Date().toISOString()});
});
app.get('', (req, res) => {
    const data = [];
    res.status(202).json({success: true, message: "Data Fetch Successfully", timestamp: new Date().toISOString(), data});
})

// API routes
app.use("/api/v1", routes);

// teacher Route
const {syncDatabase} = require("./models/Index");
const teacherroute = require("./routes/teacher.routes");
const studentroute = require("./routes/student.routes");
const subjectroute = require("./routes/subject.route");
const classroute = require("./routes/class.routes");
const attendanceRoute = require("./routes/attendance.routes");
const authRoute = require("./routes/auth.routes");

const {verifyToken} = require("./middlewares/auth.middleware");

// Public routes (if any, or leave auth public)

// Protected routes
app.use("/api/v1/teacher", verifyToken, teacherroute);
app.use("/api/v1/student", verifyToken, studentroute);
app.use("/api/v1/subject", verifyToken, subjectroute);
app.use("/api/v1/class", verifyToken, classroute);
app.use("/api/v1/attendance", verifyToken, attendanceRoute);
app.use("/api/v1/auth", authRoute);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/", indexRouter);
app.use("/users", usersRouter);
syncDatabase();
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});
// error handler
app.use(function (err, req, res, next) { // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render("error");
});
// startServer();

module.exports = app;
