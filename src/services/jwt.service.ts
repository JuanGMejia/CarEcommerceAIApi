
import { Injectable } from '@nestjs/common';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { BearerStrategy } from 'passport-azure-ad';

@Injectable()
export class JwtStrategy extends PassportStrategy(BearerStrategy, 'azure-ad') {
  userInfo: {
    name: string;
    oid: string;
  };
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      identityMetadata: `https://login.microsoftonline.com/${process.env.TENANT_ID}/v2.0/.well-known/openid-configuration`,
      clientID: process.env.CLIENT_ID,
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(userInfo: {
    name: string;
    oid: string;
  }): Promise<any> {
    this.userInfo = userInfo;
    return userInfo;
  }
}

export const AzureADGuard = AuthGuard('azure-ad');