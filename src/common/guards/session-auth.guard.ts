import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { auth } from '../../auth/auth.config';

/** Convert Node.js IncomingMessage headers to a Web API Headers object. */
function toWebHeaders(rawHeaders: Record<string, string | string[] | undefined>): Headers {
  const headers = new Headers();
  for (const [key, value] of Object.entries(rawHeaders)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => headers.append(key, v));
    } else {
      headers.set(key, value);
    }
  }
  return headers;
}

@Injectable()
export class SessionAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const session = await auth.api.getSession({
      headers: toWebHeaders(request.headers as Record<string, string | string[] | undefined>),
    });

    if (!session?.user) {
      throw new UnauthorizedException();
    }

    // Attach to request so @CurrentUser() and RolesGuard can read it.
    request.user = session.user;
    request.session = session.session;

    return true;
  }
}
