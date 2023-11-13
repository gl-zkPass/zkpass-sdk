import { injectable } from 'inversify';
import { Verifier } from '@didpass/verifier-sdk';

@injectable()
export class VerifierInstance {
  private instance: Verifier;

  // Retrieve the instance of the Verifier class from the SDK
  public getInstance(){
    if(!this.instance){
      this.instance = new Verifier();
    }
    return this.instance;
  };
};