import { ConnectService } from "./issuer/ConnectService";
import { Container } from "inversify";
import { IssuerService } from "./issuer/IssuerService";

const container = new Container();

container.bind<ConnectService>("ConnectService").to(ConnectService);

container
  .bind<IssuerService>("IssuerService")
  .to(IssuerService)
  .inSingletonScope();

export { container };
