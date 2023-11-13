import { Container }from 'inversify';
import { ZkPassProofMetadataValidator } from '@didpass/verifier-sdk';
import { VerifierService } from './services/VerifierService';
import { RequestService } from './services/RequestService';
import VerifierRepository from './services/VerifierRepository';
import { QueryBuilderService } from './services/QueryBuilderService';
import { VerifierInstance } from './services/sdk/VerifierInstance';
import { ProofVerifierService } from './services/ProofVerifierService';
import { MetadataValidator } from './services/zkpass/MetadataValidator';
import "reflect-metadata";

const container = new Container();

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
  .bind<ProofVerifierService>("ProofVerifierService")
  .to(ProofVerifierService)

container
  .bind<ZkPassProofMetadataValidator>("ZkPassProofMetadataValidator")
  .to(MetadataValidator)

container
  .bind<QueryBuilderService>("QueryBuilderService")
  .to(QueryBuilderService)

export { container };