interface ServiceError {
  service: string
  table: string
  message: string
}

interface ControllerError {
  controller: string
  message: string
}

export default class ErrorReporterService {
  static serviceError(params: ServiceError) {
    console.log(`
      Error:
        - Type        : service-error
        - ServiceName : ${params.service}
        - Table       : ${params.table}
        - Timestamp   : ${new Date()}
        - Message     : ${params.message}\n
    `);
  }

  static controllerError(params: ControllerError) {
    console.log(`
      Error:
        - Type            : controller-error
        - ControllerName  : ${params.controller}
        - Timestamp       : ${new Date()}
        - Message         : ${params.message}\n
    `);
  }
}
