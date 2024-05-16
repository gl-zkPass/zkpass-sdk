FROM asia.gcr.io/gdp-labs/gl-base/backend-node:20.11-slim

ENV TZ=Asia/Jakarta

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

ENV NODE_ENV production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3000

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --chown=nextjs:nodejs .next/standalone ./
COPY --chown=nextjs:nodejs .next/static ./.next/static
COPY prisma ./prisma
COPY entrypoint.sh /app
RUN mkdir -p /nonexistent/.npm/_logs \
    && chown -R nextjs:nodejs /nonexistent/
RUN chmod +x /app/entrypoint.sh

USER nextjs

HEALTHCHECK --start-period=5s CMD curl --fail http://localhost:3000/ || exit 1

ENTRYPOINT [ "/app/entrypoint.sh" ]
