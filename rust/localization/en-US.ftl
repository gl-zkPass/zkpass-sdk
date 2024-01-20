# en-US.ftl - English localization for ZkPassError messages

MismatchedUserDataVerifyingKey = Mismatched User Data Verifying Key: The verifying key does not match the expected user data.

MissingRootDataElementError = Missing Root Data Element: The required root data element is not found.

NotImplementedError = Functionality Not Implemented: This feature has not been implemented yet.

JoseError = Jose Library Error: { $msg }

MismatchedDvrVerifyingKey = Mismatched DVR Verifying Key: The verifying key does not match the expected DVR key.

MismatchedDvrId = Mismatched DVR ID: The provided DVR ID does not match the expected value.

MismatchedDvrTitle = Mismatched DVR Title: The DVR title does not match the expected title.

MismatchedDvrDigest = Mismatched DVR Digest: The DVR digest does not match the expected digest.

ExpiredZkPassProof = Expired ZkPass Proof: The provided ZkPass proof has expired and is no longer valid.

CustomError = Custom Error: { $msg }

Error = { $msg }

InvalidPublicKey = Invalid Public Key: The provided public key is invalid or malformed.

MissingPublicKey = Missing Public Key: The Public Key is missing and is required for the operation.

MissingApiKey = Missing API Key: The API Key is missing and is required for the operation.

MissingKeysetEndpoint = Missing Keyset field: The Keyset field is missing and is required for the operation.

HttpRequestError = Http Request Error: An error occurred while making an HTTP request.

HttpResponseError = Http Response Error: An error occurred while processing the HTTP response.

InvalidResponse = Invalid Response: The response from the server was invalid.

# en-US.ftl - English translations for ZkPassSocketError messages

SocketDeserializeError = Failed to deserialize the data: { $msg }

SocketSerializeError = Failed to serialize the data: { $msg }

ReadError = Read Error: Error occurred while reading from the socket.

WriteError = Write Error: Error occurred while writing to the socket.

ConnectionError = Connection Error: Error occurred during connection establishment.

SocketBindingError = Socket Binding Error: Failed to bind the socket to the local address.

ConversionError = Conversion Error: Error occurred during data conversion.

UtilError = Utility error occured: { $msg }

# en-US.ftl - English translations for ZkPassUtilError messages

DeserializeError = Deserialize Error: Failed to deserialize the data.

SerializeError = Serialize Error: Failed to serialize the data.

InitializeError = Initialize Error: Failed to initialize.

IOError = I/O Error: I/O Error happened.

WriteLockError = Write Lock Error: Failed to use write-lock.

ReadLockError = Read Lock Error: Failed to use read-Lock.

MissingEnvError = Missing env error occured: { $msg }

ActionError = Action error occured: { $msg }

MQError = RabbitMQ error occured: { $msg }

# en-US.ftl - English translations for ZkPassMQError messages

MQConnectionError = Connection Error: Failed to connect to rabbitmq.

ConnectionCallbackError = Connection Callback Error: Failed to register rabbitmq connection callback.

ChannelCallbackError = Channel Callback Error: Failed to register rabbitmq channel callback.

ChannelError = Channel Error: Failed to create channel.

DeclareError = Declare Error: Failed to declare exchange and queue.

PublishError = Publish Error: Failed to publish message.

ConsumeError = Consume Error: Failed to consume message.

BindError = Bind Error: Failed to bind queue to exchange.
