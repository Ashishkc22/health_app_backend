const DefaultRolePermissions = require("./DefaultRolePermissions");
const ProcessorErrors = require("./ProcessorErrors");

module.exports = {
  ErrorEnums: require("./ErrorEnums"),
  httpsErrors: require("./httpsErrors"),
  ProcessorErrors,
  EmailEnums: require("./Email"),
  DBEnums: require("./DBEnums"),
  DefaultRolePermissions,
  RegexEnum: require("./Regex"),
  CardEnums: require("./CardEnums"),
};
