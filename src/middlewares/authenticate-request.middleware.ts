import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HelperService } from 'src/helpers/helper.service';
import { AuthService } from 'src/services/auth/auth.service';

@Injectable()
export class AuthenticateRequestMiddleware implements NestMiddleware {
  constructor(
    private readonly authService: AuthService,
    private readonly helperService: HelperService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req?.headers?.authorization;

    if (!token) {
      throw new UnauthorizedException('⚠️ No authorization token found');
    }

    const data = await this.authService.authenticateUser(token);
    const user = data?.data;
    req['user'] = user;
    req['queryObj'] = this.helperService.getQueryObject(req);
    req['initiatorObj'] = this.helperService.getInitiatorObject(user);
    req['approverObj'] = this.helperService.getApproverObject(user);
    next();
  }
}
