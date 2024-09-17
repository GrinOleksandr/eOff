/* eslint-disable promise/valid-params */
import { ArgumentsHost, Catch, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class ExceptionsFilter extends BaseExceptionFilter {
  private readonly logger: Logger = new Logger();

  public override catch(exception: unknown, host: ArgumentsHost): void {
    super.catch(exception, host);

    const status = this.getHttpStatus(exception);

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      if (exception instanceof Error) {
        this.logger.error(`${exception.message}`, exception.stack);
      } else {
        // Error Notifications
        this.logger.error('UnhandledException', exception);
      }
    }
  }

  private getHttpStatus(exception: unknown): number {
    return exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
