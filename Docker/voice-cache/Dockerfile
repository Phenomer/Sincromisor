FROM redis:7

EXPOSE 6379

RUN mkdir -p /usr/local/etc/redis && \
    chown redis:redis /usr/local/etc/redis && \
    chmod 2770 /usr/local/etc/redis

COPY --chown=redis:redis ./configs/redis.conf /usr/local/etc/redis/redis.conf


CMD [ "redis-server", "/usr/local/etc/redis/redis.conf" ]
