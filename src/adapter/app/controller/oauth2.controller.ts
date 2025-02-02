import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { GoogleOauth2Guard } from '../auth/oauth2/google/googleOauth2.guard';
import { ConfigService } from '@nestjs/config';

@Controller('/oauth2')
export class Ouath2Controller {
  constructor(private readonly configService: ConfigService) {}

  @Get('/google')
  @UseGuards(GoogleOauth2Guard)
  async redirectOauth2Google(@Req() request, @Res() response: Response) {
    const token = request.user.token;

    response.redirect(this.configService.getOrThrow('OAUTH2_FRONT_REDIRECT_URL') + `?token=${token}`);
  }
}
