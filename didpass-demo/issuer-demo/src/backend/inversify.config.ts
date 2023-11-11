import { ConnectService } from "./issuer/ConnectService";
import { Container } from "inversify";
import { ISessionStorage } from "./storage/ISessionStorage";
import { RedisSessionStorage } from "./storage/redis/RedisSessionStorage";
import { IssuerService } from "./issuer/IssuerService";

const container = new Container();

container.bind<ConnectService>("ConnectService").to(ConnectService);
container
    .bind<ISessionStorage>("ISessionStorage")
    .to(RedisSessionStorage)
    .inSingletonScope();

container
    .bind<IssuerService>("IssuerService")
    .to(IssuerService)
    .inSingletonScope()

export { container };
