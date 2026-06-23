FROM node:22-alpine

WORKDIR /app

# dependencies native (sharp, canvas dll)
RUN apk add --no-cache libc6-compat python3 make g++

# 1. system deps (prisma butuh openssl)
RUN apk add --no-cache libc6-compat openssl

# enable pnpm
RUN corepack enable
RUN corepack prepare pnpm@10.12.4 --activate

COPY src/prisma ./src/prisma
# copy dependency files dulu (IMPORTANT)
COPY package.json pnpm-lock.yaml ./

# =========================
# 1. COPY package dulu
# =========================
# COPY package.json pnpm-lock.yaml ./

# =========================
# 2. COPY FILE ICONS YANG DIPAKAI POSTINSTALL
# (INI YANG FIX ERROR KAMU)
# =========================
COPY src/assets/iconify-icons ./src/assets/iconify-icons

# WAJIB: allow build scripts (fix ERR_PNPM_IGNORED_BUILDS)
ENV PNPM_IGNORE_SCRIPTS=false


RUN pnpm install --no-frozen-lockfile

# 4. generate prisma manual
RUN pnpm exec prisma generate
# baru copy source
COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "dev"]