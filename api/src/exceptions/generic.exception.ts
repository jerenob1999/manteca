import HttpException from "./http.exception";

class GenericException extends HttpException {
  constructor(error: {
    status: number;
    internalStatus: string;
    message: string;
  }) {
    super(error.status, error.internalStatus, error.message);
  }
}

export default GenericException;
