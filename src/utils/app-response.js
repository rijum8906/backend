class ApiResponse {
  constructor(message, data) {
    (this.message = message || "success"), (this.data = data || { value: true });
  }
}

module.exports = ApiResponse;
