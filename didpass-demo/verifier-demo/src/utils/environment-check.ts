class MissingEnvironmentVariablesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Missing Environment Variables';
    this.message = message;
  }
}

export const checkEnvironmentVariables = () => {
  const nextPublicUrl = process.env.NEXT_PUBLIC_URL;
  const privateKey = process.env.VERIFIER_PRIVATE_KEY_PEM;
  const jkuIssuer = process.env.KEYSET_ENDPOINT_JKU_ISSUER;
  const jkuVerifier = process.env.KEYSET_ENDPOINT_JKU_VERIFIER;

  if (!nextPublicUrl) {
    throw new MissingEnvironmentVariablesError('Next Public URL missing!');
  }
  if (!privateKey) {
    throw new MissingEnvironmentVariablesError('Verifier Private Key missing!');
  }
  if (!jkuIssuer || !jkuVerifier) {
    throw new MissingEnvironmentVariablesError(
      'Verifier or Issuer JKU Endpoint missing!'
    );
  }
};
