import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from 'src/domain/vo/user/role';
import { User } from 'src/domain/entity/user';
import { JwtService } from '@nestjs/jwt';
import { Builder } from 'builder-pattern';
import { Username } from 'src/domain/vo/user/username';
import { Email } from 'src/domain/vo/user/email';
import { USER_RDB_REPO, UserRdbRepositoryPort } from 'src/port/out/rdb/user.rdb.repository.port';
import { SubscriptionType } from 'src/domain/vo/user/subscriptionType';

@Injectable()
export class GoogleOauth2Strategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(USER_RDB_REPO)
    private readonly userRdbRepo: UserRdbRepositoryPort,
  ) {
    super({
      clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow('GOOGLE_REDIRECT_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    const { name: rawName, email: rawEmail, picture: rawPircture } = profile._json;
    const email = Email.create(rawEmail);

    // 기존 사용자 조회
    let foundUser = await this.userRdbRepo.findUserByEmail(email);

    // 신규 사용자인 경우 생성
    if (!foundUser) {
      const newUser = Builder(User)
        .email(email)
        .username(Username.create(rawName))
        .roles([Role.create('general')])
        .subscriptionType(SubscriptionType.create('free'))
        .build();

      foundUser = await this.userRdbRepo.saveUser(newUser);
    }

    // jwt 토큰 생성
    const jwtToken = this.jwtService.sign({
      id: foundUser.id!.value,
      roles: foundUser.roles.map((role) => role.value),
    });

    done(null, { token: jwtToken });
  }
}
