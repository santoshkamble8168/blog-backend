const app = require("./app")
const {config, dbConnect} = require("./config");

const PORT = config.port
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
    dbConnect(config.database)
});