import { ConnectService } from "./issuer/ConnectService";
import { Container } from "inversify";
import { ISessionStorage } from "./storage/ISessionStorage";
import { RedisSessionStorage } from "./storage/redis/RedisSessionStorage";

const container = new Container();

container.bind<ConnectService>("ConnectService").to(ConnectService);
container
    .bind<ISessionStorage>("ISessionStorage")
    .to(RedisSessionStorage)
    .inSingletonScope();


export { container };
