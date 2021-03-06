import {Injectable, UnauthorizedException} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {InjectRepository} from "@mikro-orm/nestjs";
import {EntityRepository} from "@mikro-orm/postgresql";

import {v4} from "uuid";

import {UserService} from "../user/user.service";
import {UserEntity} from "../user/user.entity";
import {IAuth, ILoginFields} from "./interfaces";
import {AuthEntity} from "./auth.entity";
import {accessTokenExpiresIn, refreshTokenExpiresIn} from "./auth.constants";
import {FilterQuery} from "@mikro-orm/core";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(AuthEntity)
    private readonly authEntityRepository: EntityRepository<AuthEntity>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  public async login(data: ILoginFields): Promise<IAuth> {
    const user = await this.userService.getByCredentials(data.email, data.password);

    if (!user) {
      throw new UnauthorizedException();
    }

    return this.loginUser(user);
  }

  public async delete(where: FilterQuery<AuthEntity>): Promise<number> {
    return this.authEntityRepository.nativeDelete(where);
  }

  public async refresh(where: FilterQuery<AuthEntity>): Promise<IAuth> {
    const authEntity = await this.authEntityRepository.findOne(where, ["user"]);

    if (!authEntity || authEntity.refreshTokenExpiresAt < new Date().getTime()) {
      throw new UnauthorizedException();
    }

    return this.loginUser(authEntity.user);
  }

  public async loginUser(user: UserEntity): Promise<IAuth> {
    const refreshToken = v4();
    const date = new Date();

    const loginUser = this.authEntityRepository.create({
      user,
      refreshToken,
      refreshTokenExpiresAt: date.getTime() + refreshTokenExpiresIn,
    });

    await this.authEntityRepository.nativeInsert(loginUser);

    return {
      accessToken: this.jwtService.sign({email: user.email}, {expiresIn: accessTokenExpiresIn / 1000}),
      refreshToken: refreshToken,
      accessTokenExpiresAt: date.getTime() + accessTokenExpiresIn,
      refreshTokenExpiresAt: date.getTime() + refreshTokenExpiresIn,
    };
  }
}
