export const createErrorClass = (name: string) => {
  function CustomError(message: string) {
    this.name = name;
    this.message = message;
    this.stack = new Error().stack;
  }
  CustomError.prototype = new Error();
  return CustomError;
};
