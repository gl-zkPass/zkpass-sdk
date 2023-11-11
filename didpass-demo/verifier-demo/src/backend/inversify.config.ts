import { Container }from 'inversify';
import { RedisSessionStorage } from './storage/Redis/RedisSessionStorage';
import { ISessionStorage } from './storage/ISessionStorage';

const container = new Container();

container
  .bind<ISessionStorage>("ISessionStorage")
  .to(RedisSessionStorage)
  .inSingletonScope();

export default container;