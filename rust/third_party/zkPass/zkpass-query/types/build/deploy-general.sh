#!/bin/bash
#shellcheck disable=SC2029

set -e
#shellcheck source=/dev/null
source /root/check.sh
IP=$(ssh deployer@"$HOST" 'echo $(hostname -I | awk "{print \$1}")')

ssh deployer@"$HOST" "mkdir -p ~/$WORKDIR/;"
scp -r "$WORKDIR"/zkpass.env token.key "$WORKDIR"/docker-compose.yml deployer@"$HOST":~/"$WORKDIR"/
ssh deployer@"$HOST" "cd ~/$WORKDIR/; cat token.key | docker login -u oauth2accesstoken --password-stdin https://asia.gcr.io"
ssh deployer@"$HOST" "cd ~/$WORKDIR/; sed -i 's|IP_ADDRESS|'${IP}'|' docker-compose.yml"

# Deploy Host
EXIT=0
ssh deployer@"$HOST" "cd ~/$WORKDIR/; docker-compose pull $MODULE; docker-compose kill $MODULE; docker-compose up -d" || EXIT=$?
ssh deployer@"$HOST" "cd ~/$WORKDIR/; docker-compose logs --tail 100"

exit $EXIT

