package com.zkpassclient;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.module.annotations.ReactModule;

import org.bouncycastle.asn1.pkcs.PrivateKeyInfo;
import org.bouncycastle.asn1.x509.SubjectPublicKeyInfo;
import org.bouncycastle.openssl.PEMParser;
import org.jose4j.jwe.ContentEncryptionAlgorithmIdentifiers;
import org.jose4j.jwe.JsonWebEncryption;
import org.jose4j.jwe.KeyManagementAlgorithmIdentifiers;
import org.jose4j.jws.AlgorithmIdentifiers;
import org.jose4j.jws.JsonWebSignature;
import org.jose4j.lang.JoseException;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.StringReader;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

@ReactModule(name = ZkPassJwtUtilityModule.NAME)
public class ZkPassJwtUtilityModule extends ReactContextBaseJavaModule {
  public static final String NAME = "ZkPassJwtUtility";

  public ZkPassJwtUtilityModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  @NonNull
  public String getName() {
    return NAME;
  }



  @ReactMethod
  public void encrypt(String key, String value, Promise p) {
    PublicKey publicKey = null;
    try {
      publicKey = getPublicKey(key);
      JsonWebEncryption jsonWebEncryption = new JsonWebEncryption();
      jsonWebEncryption.setPayload(value);
      jsonWebEncryption.setEncryptionMethodHeaderParameter(ContentEncryptionAlgorithmIdentifiers.AES_256_GCM);
      jsonWebEncryption.setAlgorithmHeaderValue(KeyManagementAlgorithmIdentifiers.ECDH_ES);
      jsonWebEncryption.setKey(publicKey);
      p.resolve(jsonWebEncryption.getCompactSerialization());
    } catch (IOException | NoSuchAlgorithmException | InvalidKeySpecException |
        InvalidPublicKeyPEMException | JoseException e) {
      p.reject(e);
    }
  }

  @ReactMethod
  public void decrypt(String key, String jwe, Promise p) {
    PrivateKey privateKey = null;
    try {
      privateKey = getPrivateKey(key);
      JsonWebEncryption jsonWebEncryption = new JsonWebEncryption();
      jsonWebEncryption.setCompactSerialization(jwe);
      jsonWebEncryption.setKey(privateKey);
      p.resolve(jsonWebEncryption.getPayload());
    } catch (InvalidPrivateKeyPEMException | IOException | NoSuchAlgorithmException |
          InvalidKeySpecException | JoseException e) {
      p.reject(e);
    }
  }

  @ReactMethod
  public void sign(String key, String value, String verifyingKeyJWKs, Promise p) {
    try {
      PrivateKey privateKey = getPrivateKey(key);
      JsonWebSignature jsonWebSignature = new JsonWebSignature();

      if(!verifyingKeyJWKs.isBlank()) {
        JSONObject verifyingKey = new JSONObject(verifyingKeyJWKs);
        String jku = verifyingKey.getString("jku");
        String kid = verifyingKey.getString("kid");
        jsonWebSignature.setHeader("jku", jku);
        jsonWebSignature.setKeyIdHeaderValue(kid);
      }

      jsonWebSignature.setPayload(value);
      jsonWebSignature.setAlgorithmHeaderValue(AlgorithmIdentifiers.ECDSA_USING_P256_CURVE_AND_SHA256);
      jsonWebSignature.setKey(privateKey);
      p.resolve(jsonWebSignature.getCompactSerialization());
    } catch (InvalidPrivateKeyPEMException | IOException | NoSuchAlgorithmException |
          InvalidKeySpecException | JoseException | JSONException e) {
      p.reject(e);
    }
  }

  @ReactMethod
  public void verify(String key, String jws, Promise p) {
    try {
      PublicKey publicKey = getPublicKey(key);
      JsonWebSignature jsonWebSignature = new JsonWebSignature();
      jsonWebSignature.setCompactSerialization(jws);
      jsonWebSignature.setKey(publicKey);
      if(!jsonWebSignature.verifySignature()) {
        p.reject(new InvalidSignatureException());
      }
      p.resolve(jsonWebSignature.getPayload());
    } catch (JoseException | IOException | NoSuchAlgorithmException | InvalidKeySpecException |
          InvalidPublicKeyPEMException e) {
      p.reject(e);
    }
  }

  PrivateKey getPrivateKey(String pem) throws InvalidPrivateKeyPEMException, IOException, NoSuchAlgorithmException, InvalidKeySpecException {
    Object object = new PEMParser(new StringReader(pem)).readObject();

    if (object instanceof PrivateKeyInfo) {
      return KeyFactory.getInstance("EC").generatePrivate(new PKCS8EncodedKeySpec(((PrivateKeyInfo) object).getEncoded()));
    }
    throw new InvalidPrivateKeyPEMException();
  }

  PublicKey getPublicKey(String pem) throws IOException, NoSuchAlgorithmException, InvalidKeySpecException, InvalidPublicKeyPEMException {
    Object object = new PEMParser(new StringReader(pem)).readObject();

    if (object instanceof SubjectPublicKeyInfo) {
      return KeyFactory.getInstance("EC").generatePublic(new X509EncodedKeySpec(((SubjectPublicKeyInfo) object).getEncoded()));
    }
    throw new InvalidPublicKeyPEMException();
  }

  public static class InvalidPublicKeyPEMException extends Exception {
    InvalidPublicKeyPEMException() {
      super("Invalid Public Key PEM");
    }
  }

  public static class InvalidPrivateKeyPEMException extends Exception {
    InvalidPrivateKeyPEMException() {
      super("Invalid Private Key PEM");
    }
  }

  public static class InvalidSignatureException extends Exception {
    InvalidSignatureException() {
      super("Invalid JWS Signature");
    }
  }
}
