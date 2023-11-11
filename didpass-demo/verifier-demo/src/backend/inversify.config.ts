import { Container }from 'inversify';
import { RedisSessionStorage } from './storage/Redis/RedisSessionStorage';
import { ISessionStorage } from './storage/ISessionStorage';
import { VerifierService } from './services/VerifierService';
import { RequestService } from './services/RequestService';
import VerifierRepository from './services/VerifierRepository';
import { QueryBuilderService } from './services/QueryBuilderService';
import { VerifierInstance } from './services/sdk/VerifierInstance';
import "reflect-metadata";

const container = new Container();

container
  .bind<ISessionStorage>("ISessionStorage")
  .to(RedisSessionStorage)
  .inSingletonScope();

container
  .bind<VerifierInstance>("VerifierInstance")
  .to(VerifierInstance)
  .inSingletonScope();

container
  .bind<VerifierRepository>("VerifierRepository")
  .to(VerifierRepository)

  container
  .bind<RequestService>("RequestService")
  .to(RequestService)

container
  .bind<VerifierService>("VerifierService")
  .to(VerifierService)

container
  .bind<QueryBuilderService>("QueryBuilderService")
  .to(QueryBuilderService)

export { container };