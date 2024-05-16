FROM asia.gcr.io/gdp-labs/gl-base/debian:stable-slim

ENV TZ=Asia/Jakarta

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

COPY target/release/zkpass-ws /app/

COPY localization /app/localization

COPY key-pairs.json /app/

COPY public-keys.json /app/

CMD ["./zkpass-ws", "vsock", "--port", "5005", "--cid", "16", "--util-port", "50051"]

