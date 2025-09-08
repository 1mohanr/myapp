const express = require("express");
const app = express();
app.get("/", (req, res) => {
res.send("Hello from Jenkins → Docker → Kubernetes CI/CD pipeline!");
});
const port = process.env.PORT || 8080;
app.listen(port, () => {
console.log(`Server running on port ${port}`);
});
