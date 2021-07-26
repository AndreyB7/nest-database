import {MikroORM} from "@mikro-orm/core";
import {MikroOrmModule} from "@mikro-orm/nestjs";
import {Module} from "@nestjs/common";

import {MikroOrmConfigService} from "../microorm.options";

@Module({
  imports: [
    MikroOrmModule.forRootAsync({
      useClass: MikroOrmConfigService,
    }),
  ],
})
export class DatabaseModule {
  constructor(private readonly orm: MikroORM) {}

  async configure(): Promise<void> {
    const migrator = this.orm.getMigrator();
    await migrator.up();
  }
}
