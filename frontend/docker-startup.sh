#!/bin/sh
yarn build && yarn install --production --ignore-scripts --prefer-offline && node_modules/.bin/next start