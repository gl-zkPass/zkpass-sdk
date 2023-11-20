class MissingEnvironmentVariablesError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Missing Environment Variables";
    this.message = message;
  }
}

const checkEnvironmentVariables = () => {
  const requiredEnvVars = [
    "NEXT_PUBLIC_URL",
    "NEXT_PUBLIC_DOMAIN_URL",
    "SECRET_KEY",
    "ISSUER_PRIVATE_KEY",
    "JWKS_ENDPOINT",
    "JWKS_KID",
    "KEY_PEM",
  ];

  const missingEnvVars = requiredEnvVars.filter((envVar) => {
    return !process.env[envVar];
  });
  
  if (missingEnvVars.length > 0) {
    const errorMessage = `The following environment variables are missing: ${missingEnvVars.join(
      ", "
    )}`;

    throw new MissingEnvironmentVariablesError(errorMessage);
  }
};

export default checkEnvironmentVariables;
