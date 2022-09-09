module.exports = {
    config: require("./commonConfigs"),
    dbConnect: require("./db"),
    postConfig: require("./postConfigs"),
    userConfig: require("./userConfig"),
    messages: require("./messages"),
    followConfig: require("./followConfig"),
    reactionConfig: require("./reactionConfig")
}