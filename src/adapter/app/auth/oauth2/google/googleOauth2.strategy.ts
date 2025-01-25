import {
  Strategy,
  VerifyCallback,
} from 'passport-google-oauth20';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from 'src/domain/vo/role';
import { User } from 'src/domain/entity/user';
import { JwtService } from '@nestjs/jwt';
import { Builder } from 'builder-pattern';
import { Username } from 'src/domain/vo/username';
import { ImgUrl } from 'src/domain/vo/imgUrl';
import { Email } from 'src/domain/vo/email';
import {
  USER_RDB_REPO,
  UserRdbRepoPort,
} from 'src/port/out/rdb/user.rdb.repo.port';

@Injectable()
export class GoogleOauth2Strategy extends PassportStrategy(
  Strategy,
  'google',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(USER_RDB_REPO)
    private readonly userRdbRepo: UserRdbRepoPort,
  ) {
    super({
      clientID: configService.getOrThrow('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow(
        'GOOGLE_CLIENT_SECRET',
      ),
      callbackURL: configService.getOrThrow(
        'GOOGLE_REDIRECT_URL',
      ),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    const {
      name: rawName,
      email: rawEmail,
      picture: rawPircture,
    } = profile._json;
    const email = Email.create(rawEmail);

    // 기존 사용자 조회
    let user = await this.userRdbRepo.findUser().byEmail(email);

    // 신규 사용자인 경우 생성
    if (!user) {
      const newUser = Builder(User)
        .email(email)
        .username(Username.create(rawName))
        .roles([Role.create('general')])
        .profileImgUrl(ImgUrl.create(rawPircture))
        .build();

      user = await this.userRdbRepo.saveUser(newUser);
    }

    // JWT 토큰 생성
    const jwtToken = this.jwtService.sign({
      id: user.id!.value,
      roles: user.roles.map((role) => role.value),
    });

    done(null, { token: jwtToken });
  }
}
