package com.reactnativetestapp.native_jwt;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.bouncycastle.asn1.pkcs.PrivateKeyInfo;
import org.bouncycastle.asn1.x509.SubjectPublicKeyInfo;
import org.bouncycastle.openssl.PEMParser;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.IOException;
import java.io.StringReader;
import java.net.URI;
import java.net.URISyntaxException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;


public class NativeJWTModule extends ReactContextBaseJavaModule {

    NativeJWTModule(ReactApplicationContext context) {
        super(context);
    }

    @NonNull
    @Override
    public String getName() {
        return "NativeJWTModule";
    }

    @ReactMethod
    public void encrypt(String key, String value, Promise p) {
        PublicKey publicKey = null;
        try {
            publicKey = getPublicKey(key);
        } catch (IOException | NoSuchAlgorithmException | InvalidKeySpecException |
                 InvalidPublicKeyPEMException e) {
            p.reject(e);
            return;
        }

        String result = Jwts.builder()
                .header()
                .type("JWT").and()
                .content(value)
                .encryptWith(publicKey, Jwts.KEY.ECDH_ES, Jwts.ENC.A256GCM)
                .compact();
        p.resolve(result);
    }

    @ReactMethod
    public void decrypt(String key, String jwe, Promise p) {
        PrivateKey privateKey = null;
        try {
            privateKey = getPrivateKey(key);
        } catch (InvalidPrivateKeyPEMException | IOException | NoSuchAlgorithmException |
                 InvalidKeySpecException e) {
            p.reject(e);
            return;
        }

        String result = new String(Jwts.parser()
                .decryptWith(privateKey)
                .build()
                .parseEncryptedContent(jwe)
                .getPayload());
        p.resolve(result);
    }

    @ReactMethod
    public void sign(String key, String value, String verifyingKeyJWKs, Promise p) {
        PrivateKey privateKey = null;
        try {
            privateKey = getPrivateKey(key);

        } catch (InvalidPrivateKeyPEMException | IOException | NoSuchAlgorithmException |
                 InvalidKeySpecException e) {
            p.reject(e);
            return;
        }

        JwtBuilder.BuilderHeader builderHeader = Jwts.builder()
                .header()
                .type("JWT");

        if (!verifyingKeyJWKs.isBlank()) {
            URI jku = null;
            String kid = null;
            try {
                JSONObject verifyingKeyJSON = new JSONObject(verifyingKeyJWKs);
                jku = new URI(verifyingKeyJSON.getString("jku"));
                kid = verifyingKeyJSON.getString("kid");
            } catch (JSONException | URISyntaxException e) {
                p.reject(e);
                return;
            }
            builderHeader = builderHeader
                    .jwkSetUrl(jku)
                    .keyId(kid);
        }


        String result = builderHeader.and()
                .content(value.getBytes(), "application/json")
                .signWith(privateKey)
                .compact();
        p.resolve(result);
    }

    @ReactMethod
    public void verify(String key, String jws, Promise p) throws RuntimeException {
        PublicKey publicKey = null;
        try {
            publicKey = getPublicKey(key);
        } catch (IOException | NoSuchAlgorithmException | InvalidKeySpecException |
                 InvalidPublicKeyPEMException e) {
            p.reject(e);
            return;
        }

        String result = new String(Jwts.parser()
                .verifyWith(publicKey)
                .build()
                .parseSignedContent(jws)
                .getPayload());

        p.resolve(result);
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
}