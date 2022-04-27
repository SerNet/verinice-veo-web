FROM ghcr.io/drpayyne/chrome-puppeteer:latest AS print

RUN ls -la

WORKDIR /usr/src/app/app

RUN ls -la